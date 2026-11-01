import { answer } from "./assistant";
import { getBusiness, platformLabel, slotsForNextDays, type Business } from "./businesses";
import { emptyDB, nowIso, nowMs, uid, updateDB } from "./store";
import type { DB, Lead, LeadStatus, Platform } from "./types";

// One engine for every business. Each business supplies its own tools, copy and enabled workflows.

interface Ctx {
  db: DB;
  biz: Business;
}

const DAY = 86_400_000;
const RANK: LeadStatus[] = ["new", "engaged", "booked", "customer"];
export const HOT_SCORE = 40;
const VIP_SPEND = 150;

const on = (c: Ctx, wf: string) => c.biz.workflows.includes(wf) && !c.db.disabled.includes(wf);

function log(
  c: Ctx,
  e: { leadId?: string; platform: Platform; workflow?: string; type: string; summary: string; payload?: Record<string, unknown>; dueInDays?: number },
) {
  const scheduled = (e.dueInDays ?? 0) > 0;
  c.db.events.unshift({
    id: uid("evt"),
    leadId: e.leadId,
    platform: e.platform,
    workflow: e.workflow,
    type: e.type,
    summary: e.summary,
    status: scheduled ? "scheduled" : "done",
    dueAt: scheduled ? new Date(nowMs(c.db) + e.dueInDays! * DAY).toISOString() : undefined,
    payload: { via: platformLabel(c.biz, e.platform), ...e.payload },
    createdAt: nowIso(c.db),
  });
}

function find(c: Ctx, leadId?: string) {
  return leadId ? c.db.leads.find((l) => l.id === leadId) : undefined;
}

function promote(c: Ctx, lead: Lead, status: LeadStatus) {
  if (RANK.indexOf(status) <= RANK.indexOf(lead.status)) return;
  const from = lead.status;
  lead.status = status;
  log(c, {
    leadId: lead.id,
    platform: "crm",
    type: "pipeline.stage_changed",
    summary: `${lead.name} moved from ${from} to ${status}`,
    payload: { contact: lead.email, from, to: status },
  });
}

function addTag(c: Ctx, lead: Lead, tag: string, workflow?: string) {
  if (lead.tags.includes(tag)) return;
  lead.tags.push(tag);
  log(c, { leadId: lead.id, platform: "crm", workflow, type: "contact.tag_added", summary: `Tagged ${lead.name}: ${tag}`, payload: { contact: lead.email, tag } });
}

function addScore(c: Ctx, lead: Lead, points: number, reason: string) {
  const before = lead.score;
  lead.score += points;
  lead.lastActivity = nowIso(c.db);
  if (before < HOT_SCORE && lead.score >= HOT_SCORE && on(c, "lead-scoring")) {
    addTag(c, lead, "hot-lead", "lead-scoring");
    log(c, {
      leadId: lead.id,
      platform: "team",
      workflow: "lead-scoring",
      type: "alert.hot_lead",
      summary: `🔥 Hot lead: ${lead.name} reached ${lead.score} points (last action: ${reason}). Follow up personally.`,
      payload: { channel: "#sales", contact: lead.email, score: lead.score, tags: lead.tags },
    });
  }
}

function upsertLead(c: Ctx, input: { name: string; email: string; source: string; consent: boolean }) {
  const email = input.email.trim().toLowerCase();
  let lead = c.db.leads.find((l) => l.email === email);
  const isNew = !lead;
  if (!lead) {
    lead = {
      id: uid("lead"),
      name: input.name.trim() || email.split("@")[0],
      email,
      source: input.source,
      status: "new",
      tags: [],
      consent: input.consent,
      score: 0,
      value: 0,
      createdAt: nowIso(c.db),
      lastActivity: nowIso(c.db),
    };
    c.db.leads.unshift(lead);
  } else {
    lead.consent = lead.consent || input.consent;
    if (input.name.trim()) lead.name = input.name.trim();
  }
  log(c, {
    leadId: lead.id,
    platform: "crm",
    type: isNew ? "contact.created" : "contact.updated",
    summary: isNew ? `New contact ${lead.name} from ${input.source}` : `${lead.name} came back via ${input.source}`,
    payload: { upsert_by: "email", email, name: lead.name, source: input.source, marketing_consent: lead.consent },
  });
  return { lead, isNew };
}

// Schedules a multi-step sequence. Each step is its own event so it can be cancelled later.
function sequence(c: Ctx, lead: Lead, o: { workflow: string; name: string; steps: string[]; days: number[]; channel?: Platform; needsConsent?: boolean }) {
  if (o.needsConsent && !lead.consent) {
    log(c, { leadId: lead.id, platform: "email", workflow: o.workflow, type: "sequence.skipped", summary: `"${o.name}" not started: no marketing consent`, payload: { sequence: o.name } });
    return;
  }
  o.steps.forEach((step, i) => {
    if (!step) return;
    const channel = o.channel ?? "email";
    log(c, {
      leadId: lead.id,
      platform: channel,
      workflow: o.workflow,
      type: channel === "sms" ? "sms.queued" : "email.queued",
      summary: `${o.name}: "${step}"`,
      dueInDays: o.days[i] ?? i * 2,
      payload: { sequence: o.name, step: i + 1, to: channel === "sms" ? "mobile on file" : lead.email, subject: step },
    });
  });
}

function stopSequence(c: Ctx, lead: Lead, name: string, reason: string) {
  const pending = c.db.events.filter((e) => e.leadId === lead.id && e.status === "scheduled" && e.payload.sequence === name);
  if (!pending.length) return;
  c.db.events = c.db.events.filter((e) => !pending.includes(e));
  log(c, {
    leadId: lead.id,
    platform: pending[0].platform,
    workflow: pending[0].workflow,
    type: "sequence.exited",
    summary: `Stopped "${name}" (${pending.length} message${pending.length > 1 ? "s" : ""} cancelled) because ${reason}`,
    payload: { sequence: name, cancelled: pending.length, reason },
  });
}

function vipCheck(c: Ctx, lead: Lead) {
  if (lead.value < VIP_SPEND || lead.tags.includes("vip") || !on(c, "vip")) return;
  addTag(c, lead, "vip", "vip");
  log(c, { leadId: lead.id, platform: "team", workflow: "vip", type: "alert.vip", summary: `⭐ ${lead.name} is now a VIP ($${lead.value} lifetime spend)`, payload: { channel: "#customers", lifetime_value: lead.value } });
  log(c, { leadId: lead.id, platform: "email", workflow: "vip", type: "email.sent", summary: `Personal thank-you and early access sent to ${lead.name}`, payload: { template: "vip_thank_you" } });
}

function startNurture(c: Ctx, lead: Lead) {
  if (!on(c, "lead-nurture")) return;
  sequence(c, lead, { workflow: "lead-nurture", name: "Welcome series", steps: c.biz.copy.nurture, days: [0, 2, 4], needsConsent: true });
}

// ---- actions -------------------------------------------------------------

type Contact = { name: string; email: string; consent?: boolean };

function captureLead(c: Ctx, i: Contact & { source: string; interest: string }) {
  const { lead, isNew } = upsertLead(c, { ...i, consent: !!i.consent });
  addTag(c, lead, `interest:${i.interest}`);
  addScore(c, lead, 10, "signed up");
  if (isNew) startNurture(c, lead);
  return lead;
}

function quiz(c: Ctx, i: Contact & { result: string }) {
  const r = c.biz.quiz.results[i.result];
  if (!r) throw new Error("Unknown quiz answer");
  const { lead, isNew } = upsertLead(c, { ...i, source: "quiz", consent: !!i.consent });
  log(c, { leadId: lead.id, platform: "website", type: "quiz.completed", summary: `${lead.name} finished the quiz. Recommended: ${r.label}`, payload: { question: c.biz.quiz.question, result: r.label } });
  addTag(c, lead, `quiz:${r.label.toLowerCase().replace(/\s+/g, "-")}`);
  addScore(c, lead, 15, "completed the quiz");
  promote(c, lead, "engaged");
  if (isNew) startNurture(c, lead);
  return { lead, result: r };
}

function chat(c: Ctx, i: { message: string; leadId?: string }) {
  const r = answer(c.biz, i.message);
  const lead = find(c, i.leadId);
  log(c, {
    leadId: lead?.id,
    platform: "assistant",
    workflow: r.handoff ? "ai-handoff" : undefined,
    type: r.handoff ? "assistant.handoff" : "assistant.answered",
    summary: r.handoff ? `"${i.message.slice(0, 60)}": not in approved content, passed to the team` : `"${i.message.slice(0, 60)}": answered from ${r.source}`,
    payload: { question: i.message, knowledge_source: r.source },
  });
  if (lead) {
    addScore(c, lead, 5, "chatted with the assistant");
    promote(c, lead, "engaged");
  }
  if (r.handoff && on(c, "ai-handoff")) {
    log(c, { leadId: lead?.id, platform: "team", workflow: "ai-handoff", type: "task.created", summary: `Reply needed: "${i.message.slice(0, 60)}"`, payload: { channel: "#support", due: "1 business day" } });
  }
  return r;
}

function book(c: Ctx, i: Contact & { slot: string; service: string }) {
  const svc = c.biz.services.find((s) => s.id === i.service) ?? c.biz.services[0];
  if (c.db.bookings.some((b) => b.slot === i.slot && b.status === "upcoming")) throw new Error("That time was just taken. Please pick another.");
  const { lead } = upsertLead(c, { ...i, source: "booking", consent: !!i.consent });
  const booking = { id: uid("bk"), leadId: lead.id, slot: i.slot, service: svc.id, status: "upcoming" as const, createdAt: nowIso(c.db) };
  c.db.bookings.unshift(booking);
  const when = new Date(i.slot).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  log(c, { leadId: lead.id, platform: "booking", workflow: "booking-confirm", type: "appointment.scheduled", summary: `${svc.title} booked for ${when}`, payload: { service: svc.title, start: i.slot, minutes: svc.minutes, invitee: { name: lead.name, email: lead.email } } });
  if (on(c, "booking-confirm")) {
    if (svc.deposit) {
      log(c, { leadId: lead.id, platform: "payments", workflow: "booking-confirm", type: "payment.succeeded", summary: `$${svc.deposit} deposit collected for ${svc.title}`, payload: { amount: svc.deposit, currency: "usd", purpose: "booking deposit" } });
    }
    log(c, { leadId: lead.id, platform: "email", workflow: "booking-confirm", type: "email.sent", summary: `Confirmation and calendar invite sent for ${when}`, payload: { template: "booking_confirmation", to: lead.email } });
    const untilReminder = Math.max(0.05, (new Date(i.slot).getTime() - nowMs(c.db)) / DAY - 1);
    sequence(c, lead, { workflow: "booking-confirm", name: "Appointment reminder", steps: ["Reminder: see you tomorrow"], days: [untilReminder], channel: c.biz.stack.sms ? "sms" : "email" });
  }
  addTag(c, lead, "booked");
  addScore(c, lead, 30, "booked an appointment");
  promote(c, lead, "booked");
  stopSequence(c, lead, "Welcome series", "they booked an appointment");
  return booking;
}

function completeSession(c: Ctx, i: { bookingId: string }) {
  const b = c.db.bookings.find((x) => x.id === i.bookingId);
  if (!b) throw new Error("Booking not found");
  if (b.status === "completed") return b;
  b.status = "completed";
  const lead = find(c, b.leadId)!;
  const svc = c.biz.services.find((s) => s.id === b.service)!;
  lead.value += svc.price;
  log(c, { leadId: lead.id, platform: "booking", workflow: "post-session", type: "appointment.completed", summary: `${lead.name} attended ${svc.title}${svc.price ? ` ($${svc.price})` : ""}`, payload: { service: svc.title, amount: svc.price } });
  stopSequence(c, lead, "Appointment reminder", "the appointment already happened");
  if (svc.price) promote(c, lead, "customer");
  if (on(c, "post-session")) {
    const channel = c.biz.stack.sms ? "sms" : "email";
    sequence(c, lead, { workflow: "post-session", name: "After-visit follow-up", steps: ["Thank you for coming in today", c.biz.copy.review, c.biz.copy.rebook], days: [0, 2, 21], channel });
  }
  vipCheck(c, lead);
  return b;
}

function startCheckout(c: Ctx, i: Contact & { sku: string }) {
  const item = c.biz.catalog.find((x) => x.sku === i.sku);
  if (!item) throw new Error("Unknown item");
  const { lead } = upsertLead(c, { ...i, source: "checkout", consent: !!i.consent });
  const checkout = { id: uid("co"), leadId: lead.id, sku: item.sku, status: "open" as const, createdAt: nowIso(c.db) };
  c.db.checkouts.unshift(checkout);
  log(c, { leadId: lead.id, platform: "store", type: "checkout.started", summary: `${lead.name} started checkout: ${item.title} ($${item.price})`, payload: { checkout_id: checkout.id, line_items: [{ sku: item.sku, price: item.price }] } });
  addScore(c, lead, 20, "started checkout");
  if (on(c, "abandoned-checkout")) {
    sequence(c, lead, { workflow: "abandoned-checkout", name: "Abandoned checkout", steps: c.biz.copy.abandoned, days: [1, 2] });
  }
  return checkout;
}

function purchase(c: Ctx, i: { checkoutId: string }) {
  const co = c.db.checkouts.find((x) => x.id === i.checkoutId);
  if (!co) throw new Error("Checkout not found");
  if (co.status === "paid") throw new Error("Already paid");
  co.status = "paid";
  const item = c.biz.catalog.find((x) => x.sku === co.sku)!;
  const lead = find(c, co.leadId)!;
  const order = { id: `#${1001 + c.db.orders.length}`, leadId: lead.id, sku: item.sku, title: item.title, kind: item.kind, amount: item.price, createdAt: nowIso(c.db) };
  c.db.orders.unshift(order);
  lead.value += item.price;

  if (item.kind === "membership") {
    log(c, { leadId: lead.id, platform: "payments", workflow: "membership", type: "subscription.created", summary: `${item.title} subscription started at $${item.price}/month`, payload: { plan: item.sku, amount: item.price, interval: "month" } });
  } else {
    log(c, { leadId: lead.id, platform: "store", type: "order.paid", summary: `Order ${order.id} paid: ${item.title} ($${item.price})`, payload: { order: order.id, email: lead.email, line_items: [{ sku: item.sku, title: item.title, price: item.price }], verified: "HMAC signature" } });
  }
  stopSequence(c, lead, "Abandoned checkout", "they completed the purchase");
  stopSequence(c, lead, "Welcome series", "they became a customer");
  addTag(c, lead, `bought:${item.sku}`);
  promote(c, lead, "customer");

  if (item.kind === "course" && on(c, "course-enroll")) {
    log(c, { leadId: lead.id, platform: "courses", workflow: "course-enroll", type: "offer.granted", summary: `Course access granted: ${item.title}`, payload: { offer: item.sku, email: lead.email, send_login_email: true } });
    sequence(c, lead, { workflow: "course-enroll", name: "Course onboarding", steps: c.biz.copy.courseOnboarding, days: [0, 2, 4] });
  }
  if (item.kind === "product" && on(c, "order-followup")) {
    log(c, { leadId: lead.id, platform: "store", workflow: "order-followup", type: "fulfillment.requested", summary: `Order ${order.id} sent to fulfilment`, payload: { order: order.id } });
    const [thanks, , crossSell] = c.biz.copy.postPurchase;
    sequence(c, lead, { workflow: "order-followup", name: "Post-purchase", steps: [thanks, c.biz.copy.review, crossSell], days: [0, 10, 30] });
  }
  if (item.kind === "membership" && on(c, "membership")) {
    addTag(c, lead, "member", "membership");
    log(c, { leadId: lead.id, platform: "email", workflow: "membership", type: "email.sent", summary: `Member welcome sent to ${lead.name}`, payload: { template: "member_welcome" } });
    log(c, { leadId: lead.id, platform: "payments", workflow: "membership", type: "invoice.upcoming", summary: `Renewal: $${item.price} charge scheduled`, dueInDays: 30, payload: { amount: item.price } });
  }
  vipCheck(c, lead);
  return order;
}

// Marks every scheduled message whose time has come as sent.
function processDue(c: Ctx) {
  const now = nowMs(c.db);
  let sent = 0;
  for (const e of c.db.events) {
    if (e.status === "scheduled" && e.dueAt && new Date(e.dueAt).getTime() <= now) {
      e.status = "done";
      e.createdAt = e.dueAt;
      sent++;
    }
  }
  c.db.events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return sent;
}

// Moves the clock forward so scheduled messages visibly "send".
function advance(c: Ctx, i: { days?: number }) {
  c.db.clockDays += i.days ?? 1;
  return { sent: processDue(c), clockDays: c.db.clockDays };
}

function toggle(c: Ctx, i: { workflow: string }) {
  c.db.disabled = c.db.disabled.includes(i.workflow) ? c.db.disabled.filter((w) => w !== i.workflow) : [...c.db.disabled, i.workflow];
  return { disabled: c.db.disabled };
}

function reset(c: Ctx) {
  Object.assign(c.db, emptyDB());
  seedHistory(c);
  return { ok: true };
}

const SEED_PEOPLE = [
  "Olivia Bennett", "Liam Carter", "Ava Morales", "Noah Kim", "Sophia Patel", "Ethan Brooks", "Mia Thompson", "Lucas Wright",
  "Isabella Nguyen", "Mason Reed", "Amelia Hughes", "James Ortiz", "Harper Collins", "Benjamin Shah", "Evelyn Foster", "Henry Walsh",
  "Abigail Stone", "Alexander Price", "Emily Chen", "Daniel Rossi", "Ella Murphy", "Samuel Grant", "Grace Kelly", "Leo Fischer",
  "Chloe Martin", "Jack Turner", "Zoe Ramirez", "Owen Clarke", "Layla Hassan", "Ryan Doyle",
];

// Deterministic so each business always opens with the same believable month.
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const hourSlot = (ms: number, hour: number) => {
  const d = new Date(ms);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

// Replays ~30 days of visitor journeys at their real dates, so timestamps, sent
// emails, pipeline stages and reports all line up with each other.
function seedHistory(c: Ctx) {
  const r = rng(c.biz.id);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const results = Object.keys(c.biz.quiz.results);
  const domains = ["gmail.com", "outlook.com", "icloud.com", "yahoo.com", "proton.me"];
  const paidServices = c.biz.services.filter((s) => s.price > 0);
  const futureSlots = slotsForNextDays();
  const total = 26;

  for (let n = 0; n < total; n++) {
    const name = SEED_PEOPLE[n];
    const [first, last] = name.toLowerCase().split(" ");
    const p = { name, email: `${first}.${last}@${pick(domains)}`, consent: r() > 0.12 };
    const daysAgo = 30 - (n * 29) / total - r() * 0.8;
    c.db.clockDays = -daysAgo;
    const later = (days: number) => {
      c.db.clockDays = Math.min(0, c.db.clockDays + days);
      processDue(c);
    };
    const kind = r();

    try {
    if (kind < 0.16) {
      captureLead(c, { ...p, source: "lead form", interest: "newsletter" });
    } else if (kind < 0.3) {
      const { lead } = quiz(c, { ...p, result: pick(results) });
      if (r() > 0.5) chat(c, { leadId: lead.id, message: pick(c.biz.starters) });
    } else if (kind < 0.5) {
      const { lead } = quiz(c, { ...p, result: pick(results) });
      if (r() > 0.4) chat(c, { leadId: lead.id, message: pick(c.biz.starters) });
      later(r() * 2);
      const co = startCheckout(c, { ...p, sku: pick(c.biz.catalog).sku });
      purchase(c, { checkoutId: co.id });
    } else if (kind < 0.6) {
      // Researched, asked the assistant, then left at checkout: the classic hot lead.
      const { lead } = quiz(c, { ...p, result: pick(results) });
      chat(c, { leadId: lead.id, message: pick(c.biz.starters) });
      later(r() * 0.5);
      startCheckout(c, { ...p, sku: pick(c.biz.catalog).sku });
    } else if (kind < 0.68) {
      const co = startCheckout(c, { ...p, sku: pick(c.biz.catalog).sku });
      later(1.3);
      if (c.db.clockDays < 0) purchase(c, { checkoutId: co.id });
    } else if (kind < 0.78) {
      const lead = captureLead(c, { ...p, source: "ai assistant", interest: "question" });
      chat(c, { leadId: lead.id, message: pick(c.biz.starters) });
      if (r() > 0.6) chat(c, { leadId: lead.id, message: "Do you offer a student discount?" });
    } else if (daysAgo > 3) {
      const svc = paidServices.length && r() > 0.3 ? pick(paidServices) : c.biz.services[0];
      const slot = hourSlot(nowMs(c.db) + (1 + Math.floor(r() * 2)) * DAY, pick([10, 13, 16]));
      const b = book(c, { ...p, slot, service: svc.id });
      later((new Date(slot).getTime() - nowMs(c.db)) / DAY + 0.1);
      if (c.db.clockDays < 0) completeSession(c, { bookingId: b.id });
    } else if (futureSlots.length) {
      book(c, { ...p, slot: futureSlots.shift()!, service: pick(c.biz.services).id });
    }
    } catch {
      // A rare slot collision just skips that visitor; the rest of the month still plays out.
    }
    processDue(c);
  }
  c.db.clockDays = 0;
  // A couple of fresh bookings so the calendar always has something coming up.
  for (const name of SEED_PEOPLE.slice(total, total + 2)) {
    if (!futureSlots.length) break;
    const [first, last] = name.toLowerCase().split(" ");
    c.db.clockDays = -0.2 - r() * 0.5;
    book(c, { name, email: `${first}.${last}@${pick(domains)}`, consent: true, slot: futureSlots.splice(2, 1)[0] ?? futureSlots.shift()!, service: pick(c.biz.services).id });
  }
  c.db.clockDays = 0;
  processDue(c);
}

const PEOPLE = [
  ["Nora Bailey", "nora.bailey"], ["Theo Harris", "theo.h"], ["Ivy Coleman", "ivy.coleman"], ["Felix Moreno", "felixm"],
  ["Ruby Jensen", "ruby.j"], ["Adam Novak", "anovak"], ["Hazel Brooks", "hazel.b"], ["Caleb Ward", "caleb.ward"],
];

// Plays out a realistic mix of visitor journeys so the CRM and reports have activity to show.
function simulateTraffic(c: Ctx) {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const used = new Set(c.db.leads.map((l) => l.email));
  const people = PEOPLE.filter(([, e]) => !used.has(`${e}@mail.com`)).slice(0, 6);
  const slots = slotsForNextDays().filter((s) => !c.db.bookings.some((b) => b.slot === s));
  const results = Object.keys(c.biz.quiz.results);
  people.forEach(([name, handle], n) => {
    const p = { name, email: `${handle}@mail.com`, consent: Math.random() > 0.15 };
    switch (n % 6) {
      case 0: captureLead(c, { ...p, source: "lead form", interest: "newsletter" }); break;
      case 1: {
        const { lead } = quiz(c, { ...p, result: pick(results) });
        const co = startCheckout(c, { ...p, sku: pick(c.biz.catalog).sku });
        purchase(c, { checkoutId: co.id });
        chat(c, { leadId: lead.id, message: c.biz.starters[0] });
        break;
      }
      case 2: startCheckout(c, { ...p, sku: pick(c.biz.catalog).sku }); break;
      case 3: {
        const b = book(c, { ...p, slot: slots.shift()!, service: pick(c.biz.services).id });
        completeSession(c, { bookingId: b.id });
        break;
      }
      case 4: {
        const lead = captureLead(c, { ...p, source: "ai assistant", interest: "question" });
        chat(c, { leadId: lead.id, message: c.biz.starters[1] });
        chat(c, { leadId: lead.id, message: "Do you have a student discount?" });
        break;
      }
      case 5: {
        quiz(c, { ...p, result: pick(results) });
        book(c, { ...p, slot: slots.shift()!, service: c.biz.services[0].id });
        break;
      }
    }
  });
  return { added: people.length };
}

const ACTIONS = { lead: captureLead, quiz, chat, book, complete: completeSession, checkout: startCheckout, purchase, advance, toggle, reset, simulate: simulateTraffic };

export type ActionName = keyof typeof ACTIONS;

export function runAction(bizId: string, action: string, input: Record<string, unknown>) {
  const biz = getBusiness(bizId);
  if (!biz) throw new Error("Unknown business");
  const fn = ACTIONS[action as ActionName] as ((c: Ctx, i: unknown) => unknown) | undefined;
  if (!fn) throw new Error("Unknown action");
  return updateDB(bizId, (db) => fn({ db, biz }, input));
}
