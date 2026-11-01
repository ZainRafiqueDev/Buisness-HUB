import { CATALOG, SERVICES } from "./catalog";
import { uid, updateDB } from "./store";
import type { AutomationEvent, DB, Lead, LeadStatus, Platform } from "./types";

// Each event mirrors what the real platform would send or receive in production.
// Everything except the website, assistant and CRM store is simulated in this demo.

function log(
  db: DB,
  e: { leadId?: string; platform: Platform; type: string; summary: string; payload: Record<string, unknown>; simulated?: boolean; status?: "done" | "scheduled" },
) {
  const event: AutomationEvent = {
    id: uid("evt"),
    simulated: e.simulated ?? true,
    status: e.status ?? "done",
    createdAt: new Date().toISOString(),
    ...e,
  };
  db.events.unshift(event);
  return event;
}

const RANK: LeadStatus[] = ["new", "engaged", "booked", "customer"];

function promote(lead: Lead, status: LeadStatus) {
  if (RANK.indexOf(status) > RANK.indexOf(lead.status)) lead.status = status;
}

function addTag(db: DB, lead: Lead, tag: string) {
  if (lead.tags.includes(tag)) return;
  lead.tags.push(tag);
  log(db, {
    leadId: lead.id,
    platform: "crm",
    type: "crm.contact.tag_added",
    summary: `Tagged ${lead.name} with "${tag}"`,
    simulated: false,
    payload: { contactId: lead.id, tag },
  });
}

// Upsert by email so the same person never becomes two CRM records.
function upsertLead(db: DB, input: { name: string; email: string; interest: string; source: string; consent: boolean }) {
  const email = input.email.trim().toLowerCase();
  let lead = db.leads.find((l) => l.email === email);
  const isNew = !lead;
  if (!lead) {
    lead = {
      id: uid("lead"),
      name: input.name.trim() || email.split("@")[0],
      email,
      interest: input.interest,
      source: input.source,
      status: "new",
      tags: [],
      consent: input.consent,
      createdAt: new Date().toISOString(),
    };
    db.leads.unshift(lead);
  } else {
    lead.consent = lead.consent || input.consent;
    if (input.name.trim()) lead.name = input.name.trim();
  }
  log(db, {
    leadId: lead.id,
    platform: "crm",
    type: isNew ? "crm.contact.created" : "crm.contact.updated",
    summary: `${isNew ? "New contact" : "Updated contact"}: ${lead.name} via ${input.source}`,
    simulated: false,
    payload: {
      endpoint: "POST /crm/v3/objects/contacts (HubSpot-style upsert by email)",
      properties: { email, firstname: lead.name, lead_source: input.source, interest: input.interest, marketing_consent: lead.consent },
    },
  });
  return { lead, isNew };
}

function scheduleDrip(db: DB, lead: Lead, sequence: string, steps: string[]) {
  if (!lead.consent) {
    log(db, {
      leadId: lead.id,
      platform: "email",
      type: "email.sequence.skipped",
      summary: `No marketing consent — "${sequence}" not started`,
      payload: { reason: "consent_missing" },
    });
    return;
  }
  steps.forEach((step, i) =>
    log(db, {
      leadId: lead.id,
      platform: "email",
      type: "email.sequence.step_scheduled",
      summary: `${sequence} · Day ${i * 2}: ${step}`,
      status: i === 0 ? "done" : "scheduled",
      payload: { sequence, step: i + 1, sendAfterDays: i * 2, to: lead.email },
    }),
  );
}

function stopDrip(db: DB, lead: Lead, sequence: string, reason: string) {
  const pending = db.events.filter(
    (e) => e.leadId === lead.id && e.status === "scheduled" && e.payload.sequence === sequence,
  );
  if (!pending.length) return;
  db.events = db.events.filter((e) => !pending.includes(e));
  log(db, {
    leadId: lead.id,
    platform: "email",
    type: "email.sequence.exited",
    summary: `Stopped "${sequence}" (${pending.length} emails cancelled): ${reason}`,
    payload: { sequence, cancelled: pending.length, reason },
  });
}

export function captureLead(input: { name: string; email: string; interest: string; source: string; consent: boolean }) {
  return updateDB((db) => {
    const { lead, isNew } = upsertLead(db, input);
    addTag(db, lead, `interest:${input.interest}`);
    if (isNew) {
      scheduleDrip(db, lead, "Welcome & nurture", [
        "Welcome + free Focus checklist",
        "Story: how clients reset their week",
        "Invite: book a free discovery call",
      ]);
    }
    return lead;
  });
}

export function createBooking(input: { name: string; email: string; slot: string; service: string; consent: boolean }) {
  return updateDB((db) => {
    const service = SERVICES.find((s) => s.id === input.service) ?? SERVICES[0];
    const { lead } = upsertLead(db, { ...input, interest: "coaching", source: "booking" });
    if (db.bookings.some((b) => b.slot === input.slot)) throw new Error("That slot was just taken");
    const booking = { id: uid("bk"), leadId: lead.id, slot: input.slot, service: service.id, createdAt: new Date().toISOString() };
    db.bookings.unshift(booking);
    log(db, {
      leadId: lead.id,
      platform: "booking",
      type: "invitee.created",
      summary: `${service.title} booked for ${new Date(input.slot).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`,
      payload: { webhook: "Calendly/Cal.com style invitee.created", event_type: service.title, start_time: input.slot, invitee: { name: lead.name, email: lead.email } },
    });
    promote(lead, "booked");
    addTag(db, lead, "booked-call");
    stopDrip(db, lead, "Welcome & nurture", "lead booked a call, no more 'please book' emails");
    log(db, {
      leadId: lead.id,
      platform: "email",
      type: "email.transactional.sent",
      summary: "Booking confirmation + calendar invite sent; reminder scheduled 24h before",
      payload: { template: "booking_confirmation", to: lead.email },
    });
    return booking;
  });
}

export function purchase(input: { name: string; email: string; sku: string }) {
  return updateDB((db) => {
    const item = CATALOG.find((c) => c.sku === input.sku);
    if (!item) throw new Error("Unknown item");
    const { lead } = upsertLead(db, { ...input, interest: item.kind, source: "checkout", consent: true });
    const order = { id: `#${1000 + db.orders.length + 1}`, leadId: lead.id, sku: item.sku, title: item.title, kind: item.kind, amount: item.price, createdAt: new Date().toISOString() };
    db.orders.unshift(order);
    log(db, {
      leadId: lead.id,
      platform: "shopify",
      type: "orders/create",
      summary: `Order ${order.id} paid: ${item.title} ($${item.price})`,
      payload: { webhook: "Shopify orders/create (HMAC verified in production)", order_number: order.id, email: lead.email, line_items: [{ sku: item.sku, title: item.title, price: item.price }], financial_status: "paid" },
    });
    if (item.kind === "course") {
      log(db, {
        leadId: lead.id,
        platform: "kajabi",
        type: "offer.granted",
        summary: `Kajabi access granted: ${item.title}. Login email sent to student`,
        payload: { action: "Grant offer to contact (Kajabi API / automation)", offer: item.sku, email: lead.email, send_welcome_email: true },
      });
    } else {
      log(db, {
        leadId: lead.id,
        platform: "shopify",
        type: "fulfillment.pending",
        summary: "Order sent to fulfilment; shipping updates handled by Shopify",
        payload: { order_number: order.id },
      });
    }
    promote(lead, "customer");
    addTag(db, lead, `customer:${item.kind}`);
    stopDrip(db, lead, "Welcome & nurture", "lead became a customer");
    scheduleDrip(db, lead, item.kind === "course" ? "Course onboarding" : "Post-purchase", item.kind === "course"
      ? ["Welcome to the course + how to log in", "Lesson 1 nudge if not started", "Invite to live Q&A"]
      : ["Thank you + what to expect", "How to get the most from your planner", "10% off the Focus Reset course"]);
    return order;
  });
}

export function noteAssistant(leadId: string | undefined, question: string, matched: string) {
  return updateDB((db) => {
    log(db, {
      leadId,
      platform: "ai-assistant",
      type: "assistant.answered",
      summary:
        matched === "human handoff"
          ? `Q: "${question.slice(0, 70)}" → not in approved content, handed off to the team`
          : `Q: "${question.slice(0, 70)}" → answered from "${matched}"`,
      simulated: false,
      payload: { question, source: matched },
    });
    const lead = leadId ? db.leads.find((l) => l.id === leadId) : undefined;
    if (lead) promote(lead, "engaged");
  });
}
