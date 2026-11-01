"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import EventRow from "@/components/EventRow";
import { PLATFORM_STYLE } from "@/components/PlatformBadge";
import { getBusiness, platformLabel, type Business } from "@/lib/businesses";
import { act, fmtSlot, money, timeAgo, useLiveState, type State } from "@/lib/client";
import type { Lead, LeadStatus, Platform } from "@/lib/types";

const STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: "new", label: "New", color: "bg-stone-400" },
  { id: "engaged", label: "Engaged", color: "bg-amber-500" },
  { id: "booked", label: "Booked", color: "bg-blue-500" },
  { id: "customer", label: "Customer", color: "bg-emerald-600" },
];

type Tab = "pipeline" | "contacts" | "activity";

export default function Crm() {
  const { biz: id } = useParams<{ biz: string }>();
  const biz = getBusiness(id)!;
  const { state: s, refresh } = useLiveState(id);
  const [tab, setTab] = useState<Tab>("pipeline");
  const [selected, setSelected] = useState<string>();

  const lead = s?.leads.find((l) => l.id === selected);
  const revenue = s?.orders.reduce((n, o) => n + o.amount, 0) ?? 0;
  const bookingRevenue = s?.bookings.filter((b) => b.status === "completed").reduce((n, b) => n + (biz.services.find((x) => x.id === b.service)?.price ?? 0), 0) ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <AdminHeader biz={id} title={`${platformLabel(biz, "crm")} · Contacts & pipeline`} text="Every visitor action lands here, and automations run from it." state={s} refresh={refresh} />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Contacts" value={s?.leads.length ?? 0} />
        <Kpi label="Hot leads" value={s?.leads.filter((l) => l.tags.includes("hot-lead")).length ?? 0} />
        <Kpi label="Upcoming bookings" value={s?.bookings.filter((b) => b.status === "upcoming").length ?? 0} />
        <Kpi label="Revenue" value={money(revenue + bookingRevenue)} />
        <Kpi label="Messages scheduled" value={s?.events.filter((e) => e.status === "scheduled").length ?? 0} />
      </div>

      <div className="mt-6 flex gap-1 rounded-xl bg-stone-200/70 p-1 sm:w-fit">
        {(["pipeline", "contacts", "activity"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-5 py-2 text-[15px] font-semibold capitalize sm:flex-none ${tab === t ? "bg-white shadow-sm" : "text-stone-600"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {!s ? (
        <p className="py-16 text-center text-stone-500">Loading…</p>
      ) : s.leads.length === 0 && tab !== "activity" ? (
        <Empty />
      ) : tab === "pipeline" ? (
        <Pipeline s={s} onOpen={setSelected} />
      ) : tab === "contacts" ? (
        <Contacts s={s} onOpen={setSelected} />
      ) : (
        <Activity biz={biz} s={s} />
      )}

      {lead && s && <ContactDrawer biz={biz} lead={lead} s={s} refresh={refresh} onClose={() => setSelected(undefined)} />}
    </main>
  );
}

function Empty() {
  return (
    <div className="card mt-6 p-12 text-center">
      <p className="text-xl font-semibold">No contacts yet</p>
      <p className="mt-2 text-stone-600">Use the website in another tab, or click “Simulate visitors” above.</p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <div className="text-[15px] text-stone-600">{label}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, score);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full ${score >= 40 ? "bg-orange-500" : "bg-stone-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-sm font-semibold tabular-nums">{score}</span>
    </div>
  );
}

function Pipeline({ s, onOpen }: { s: State; onOpen: (id: string) => void }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((st) => {
        const leads = s.leads.filter((l) => l.status === st.id);
        return (
          <section key={st.id} className="rounded-2xl bg-stone-100 p-3">
            <h2 className="flex items-center gap-2 px-2 py-1.5 font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full ${st.color}`} />
              {st.label}
              <span className="ml-auto rounded-full bg-white px-2 text-sm text-stone-600">{leads.length}</span>
            </h2>
            <div className="mt-2 space-y-2.5">
              {leads.map((l) => (
                <button key={l.id} onClick={() => onOpen(l.id)} className="card block w-full p-4 text-left transition hover:border-stone-400">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{l.name}</span>
                    {l.value > 0 && <span className="text-sm font-semibold text-emerald-700">{money(l.value)}</span>}
                  </div>
                  <div className="text-sm text-stone-500">via {l.source}</div>
                  <div className="mt-2.5">
                    <ScoreBar score={l.score} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {l.tags.includes("hot-lead") && <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-900">🔥 hot</span>}
                    {l.tags.includes("vip") && <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-900">⭐ VIP</span>}
                    {l.tags.includes("member") && <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-900">member</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Contacts({ s, onOpen }: { s: State; onOpen: (id: string) => void }) {
  return (
    <div className="card mt-6 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead className="border-b border-stone-200 bg-stone-50 text-sm text-stone-600">
          <tr>
            <th className="px-5 py-3 font-semibold">Name</th>
            <th className="px-5 py-3 font-semibold">Stage</th>
            <th className="px-5 py-3 font-semibold">Source</th>
            <th className="px-5 py-3 font-semibold">Score</th>
            <th className="px-5 py-3 font-semibold">Spend</th>
            <th className="px-5 py-3 font-semibold">Last active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {s.leads.map((l) => (
            <tr key={l.id} onClick={() => onOpen(l.id)} className="cursor-pointer hover:bg-stone-50">
              <td className="px-5 py-3.5">
                <div className="font-semibold">{l.name}</div>
                <div className="text-sm text-stone-500">{l.email}</div>
              </td>
              <td className="px-5 py-3.5 capitalize">{l.status}</td>
              <td className="px-5 py-3.5 text-stone-700">{l.source}</td>
              <td className="w-40 px-5 py-3.5"><ScoreBar score={l.score} /></td>
              <td className="px-5 py-3.5 font-semibold">{money(l.value)}</td>
              <td className="px-5 py-3.5 text-stone-600">{timeAgo(l.lastActivity, s.now)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Activity({ biz, s }: { biz: Business; s: State }) {
  const [filter, setFilter] = useState<Platform | "all" | "scheduled">("all");
  const used = Array.from(new Set(s.events.map((e) => e.platform)));
  const events = s.events
    .filter((e) => (filter === "all" ? true : filter === "scheduled" ? e.status === "scheduled" : e.platform === filter))
    .sort((a, b) => (filter === "scheduled" ? a.dueAt!.localeCompare(b.dueAt!) : 0));
  const names = new Map(s.leads.map((l) => [l.id, l.name]));
  return (
    <section className="card mt-6 overflow-hidden">
      <div className="flex flex-wrap gap-1.5 border-b border-stone-200 p-4">
        {(["all", "scheduled", ...used] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${filter === p ? "bg-stone-900 text-white" : p === "all" || p === "scheduled" ? "bg-stone-100 text-stone-700" : PLATFORM_STYLE[p as Platform]}`}
          >
            {p === "all" ? "Everything" : p === "scheduled" ? "⏱ Scheduled" : platformLabel(biz, p as Platform)}
          </button>
        ))}
      </div>
      {events.length === 0 && <p className="p-8 text-center text-stone-500">Nothing here yet.</p>}
      <ul className="max-h-[640px] divide-y divide-stone-100 overflow-y-auto">
        {events.map((e) => (
          <EventRow key={e.id} biz={biz} e={e} now={s.now} leadName={e.leadId ? names.get(e.leadId) : undefined} />
        ))}
      </ul>
    </section>
  );
}

function ContactDrawer({ biz, lead, s, refresh, onClose }: { biz: Business; lead: Lead; s: State; refresh: () => void; onClose: () => void }) {
  const bookings = s.bookings.filter((b) => b.leadId === lead.id);
  const orders = s.orders.filter((o) => o.leadId === lead.id);
  const events = s.events.filter((e) => e.leadId === lead.id);

  async function complete(bookingId: string) {
    await act(biz.id, "complete", { bookingId });
    refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-stone-200 bg-white p-6">
          <div>
            <h2 className="text-2xl font-bold">{lead.name}</h2>
            <p className="text-stone-600">{lead.email}</p>
          </div>
          <button onClick={onClose} className="text-3xl leading-none text-stone-400 hover:text-stone-800" aria-label="Close">×</button>
        </div>
        <div className="space-y-7 p-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Stage" value={lead.status} />
            <Stat label="Spend" value={money(lead.value)} />
            <Stat label="Source" value={lead.source} />
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Lead score</h3>
            <ScoreBar score={lead.score} />
            <p className="mt-1 text-sm text-stone-500">40+ triggers a hot-lead alert to the team.</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((t) => (
                <span key={t} className="rounded-lg bg-stone-100 px-2.5 py-1 font-mono text-sm">{t}</span>
              ))}
              <span className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${lead.consent ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                {lead.consent ? "✓ marketing consent" : "no marketing consent"}
              </span>
            </div>
          </div>
          {bookings.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Appointments</h3>
              <ul className="space-y-2">
                {bookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3">
                    <div>
                      <div className="font-medium">{biz.services.find((x) => x.id === b.service)?.title}</div>
                      <div className="text-sm text-stone-600">{fmtSlot(b.slot)}</div>
                    </div>
                    {b.status === "upcoming" ? (
                      <button className="btn btn-sm" onClick={() => complete(b.id)}>Mark attended</button>
                    ) : (
                      <span className="text-sm font-semibold text-emerald-700">✓ Attended</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {orders.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Orders</h3>
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="flex justify-between rounded-xl border border-stone-200 p-3">
                    <span>
                      <span className="font-medium">{o.title}</span> <span className="text-sm text-stone-500">{o.id}</span>
                    </span>
                    <span className="font-semibold">{money(o.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="mb-2 font-semibold">Timeline</h3>
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
              {events.map((e) => (
                <EventRow key={e.id} biz={biz} e={e} now={s.now} />
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <div className="text-sm text-stone-500">{label}</div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}
