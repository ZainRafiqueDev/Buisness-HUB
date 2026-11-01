"use client";

import { useEffect, useState } from "react";
import PlatformBadge, { PLATFORM } from "@/components/PlatformBadge";
import { getState, post, timeAgo, type State } from "@/lib/client";
import type { AutomationEvent, LeadStatus, Platform } from "@/lib/types";

const STATUS: Record<LeadStatus, string> = {
  new: "bg-stone-100 text-stone-700",
  engaged: "bg-amber-100 text-amber-800",
  booked: "bg-blue-100 text-blue-800",
  customer: "bg-emerald-100 text-emerald-800",
};

export default function Dashboard() {
  const [s, setS] = useState<State>();
  const [selected, setSelected] = useState<string>();
  const [filter, setFilter] = useState<Platform | "all">("all");

  useEffect(() => {
    const load = () => getState().then(setS).catch(() => {});
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  if (!s) return <div className="p-10 text-center text-stone-500">Loading…</div>;

  const lead = s.leads.find((l) => l.id === selected);
  const revenue = s.orders.reduce((sum, o) => sum + o.amount, 0);
  const events = s.events.filter((e) => (filter === "all" || e.platform === filter) && (!selected || e.leadId === selected));
  const scheduled = s.events.filter((e) => e.status === "scheduled").length;

  async function reset() {
    if (!confirm("Clear all demo data?")) return;
    await post("/api/reset", {});
    try {
      localStorage.removeItem("visitor");
    } catch {}
    setSelected(undefined);
    setS(await getState());
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">CRM & automations</h1>
          <p className="text-sm text-stone-600">What happens behind the website, updating live every 2 seconds.</p>
        </div>
        <button onClick={reset} className="btn-ghost">Reset demo data</button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Contacts" value={s.leads.length} />
        <Kpi label="Bookings" value={s.bookings.length} />
        <Kpi label="Orders" value={s.orders.length} />
        <Kpi label="Revenue (demo)" value={`$${revenue}`} />
        <Kpi label="Emails scheduled" value={scheduled} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <h2 className="font-semibold">Contacts</h2>
            {selected && (
              <button onClick={() => setSelected(undefined)} className="text-xs text-emerald-700 hover:underline">
                Show all activity
              </button>
            )}
          </div>
          {s.leads.length === 0 && (
            <p className="p-6 text-sm text-stone-500">No contacts yet. Use the website or the assistant to create one.</p>
          )}
          <ul className="max-h-[560px] divide-y divide-stone-100 overflow-y-auto">
            {s.leads.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => setSelected(l.id === selected ? undefined : l.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-stone-50 ${l.id === selected ? "bg-emerald-50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{l.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS[l.status]}`}>{l.status}</span>
                  </div>
                  <div className="text-xs text-stone-500">
                    {l.email} · via {l.source} · {timeAgo(l.createdAt)}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {l.tags.map((t) => (
                      <span key={t} className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">{t}</span>
                    ))}
                    {!l.consent && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-700">no marketing consent</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
            <h2 className="font-semibold">{lead ? `Timeline: ${lead.name}` : "Automation activity"}</h2>
            <div className="flex flex-wrap gap-1">
              {(["all", ...Object.keys(PLATFORM)] as (Platform | "all")[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${filter === p ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                >
                  {p === "all" ? "All" : PLATFORM[p].label}
                </button>
              ))}
            </div>
          </div>
          {events.length === 0 && <p className="p-6 text-sm text-stone-500">No activity yet.</p>}
          <ul className="max-h-[560px] divide-y divide-stone-100 overflow-y-auto">
            {events.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function EventRow({ e }: { e: AutomationEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="px-4 py-3">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge p={e.platform} />
          <code className="text-[11px] text-stone-500">{e.type}</code>
          {e.status === "scheduled" && <span className="rounded bg-stone-100 px-1.5 text-[10px] text-stone-600">scheduled</span>}
          <span className={`rounded px-1.5 text-[10px] ${e.simulated ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
            {e.simulated ? "simulated" : "live"}
          </span>
          <span className="ml-auto text-[11px] text-stone-400">{timeAgo(e.createdAt)}</span>
        </div>
        <div className="mt-1 text-sm">{e.summary}</div>
      </button>
      {open && (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-stone-900 p-3 font-mono text-[11px] leading-relaxed text-stone-100">
          {JSON.stringify(e.payload, null, 2)}
        </pre>
      )}
    </li>
  );
}
