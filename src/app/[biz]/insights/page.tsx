"use client";

import { useParams } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import { getBusiness } from "@/lib/businesses";
import { money, useLiveState } from "@/lib/client";

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

export default function Insights() {
  const { biz: id } = useParams<{ biz: string }>();
  const biz = getBusiness(id)!;
  const { state: s, refresh } = useLiveState(id, 3000);

  const leads = s?.leads ?? [];
  const engagedPlus = leads.filter((l) => l.status !== "new").length;
  const bookedPlus = leads.filter((l) => l.status === "booked" || l.status === "customer").length;
  const customers = leads.filter((l) => l.status === "customer").length;
  const funnel = [
    { label: "Contacts captured", value: leads.length },
    { label: "Engaged (quiz, chat, checkout)", value: engagedPlus },
    { label: "Booked or bought", value: bookedPlus },
    { label: "Paying customers", value: customers },
  ];

  const orders = s?.orders ?? [];
  const sessionRevenue = (s?.bookings ?? []).filter((b) => b.status === "completed").reduce((n, b) => n + (biz.services.find((x) => x.id === b.service)?.price ?? 0), 0);
  const orderRevenue = orders.reduce((n, o) => n + o.amount, 0);
  const checkouts = s?.checkouts ?? [];
  const abandoned = checkouts.filter((c) => c.status === "open").length;
  const recovered = s?.events.filter((e) => e.type === "sequence.exited" && e.payload.sequence === "Abandoned checkout").length ?? 0;

  const sources = Object.entries(leads.reduce<Record<string, number>>((m, l) => ({ ...m, [l.source]: (m[l.source] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const items = biz.catalog.map((c) => ({ title: c.title, count: orders.filter((o) => o.sku === c.sku).length, revenue: orders.filter((o) => o.sku === c.sku).reduce((n, o) => n + o.amount, 0) }));

  const chats = s?.events.filter((e) => e.platform === "assistant") ?? [];
  const handoffs = chats.filter((e) => e.type === "assistant.handoff").length;
  const sent = s?.events.filter((e) => (e.platform === "email" || e.platform === "sms") && e.status === "done" && e.type !== "sequence.exited" && e.type !== "sequence.skipped").length ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <AdminHeader biz={id} title="Insights" text="Where leads come from, where they drop off, and what the automations are doing." state={s} refresh={refresh} />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Total revenue" value={money(orderRevenue + sessionRevenue)} />
        <Kpi label="Lead → customer" value={pct(customers, leads.length)} />
        <Kpi label="Average order" value={orders.length ? money(Math.round(orderRevenue / orders.length)) : "–"} />
        <Kpi label="Messages sent automatically" value={sent} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Conversion funnel">
          <div className="space-y-4">
            {funnel.map((f, i) => (
              <div key={f.label}>
                <div className="mb-1.5 flex justify-between text-[15px]">
                  <span className="font-medium">{f.label}</span>
                  <span className="font-semibold tabular-nums">
                    {f.value}
                    {i > 0 && <span className="ml-2 font-normal text-stone-500">{pct(f.value, funnel[0].value)}</span>}
                  </span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: funnel[0].value ? `${(f.value / funnel[0].value) * 100}%` : "0%", opacity: 1 - i * 0.18 }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Where contacts come from">
          {sources.length === 0 ? <EmptyNote /> : (
            <div className="space-y-3">
              {sources.map(([src, n]) => (
                <div key={src} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-[15px] capitalize">{src}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-stone-700" style={{ width: `${(n / sources[0][1]) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold tabular-nums">{n}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Sales by item">
          <table className="w-full text-left text-[15px]">
            <thead className="text-sm text-stone-500">
              <tr><th className="pb-2 font-semibold">Item</th><th className="pb-2 text-right font-semibold">Sold</th><th className="pb-2 text-right font-semibold">Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((it) => (
                <tr key={it.title}><td className="py-2.5">{it.title}</td><td className="py-2.5 text-right tabular-nums">{it.count}</td><td className="py-2.5 text-right font-semibold tabular-nums">{money(it.revenue)}</td></tr>
              ))}
              {sessionRevenue > 0 && <tr><td className="py-2.5">Appointments attended</td><td className="py-2.5 text-right">–</td><td className="py-2.5 text-right font-semibold tabular-nums">{money(sessionRevenue)}</td></tr>}
            </tbody>
          </table>
        </Panel>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Panel title="Checkout recovery">
            <Big value={abandoned} label="checkouts still open" />
            <Big value={recovered} label="finished after a reminder or on their own" />
            <Big value={pct(checkouts.length - abandoned, checkouts.length)} label="checkout completion rate" />
          </Panel>
          <Panel title="AI assistant">
            <Big value={chats.length} label="questions asked" />
            <Big value={pct(chats.length - handoffs, chats.length)} label="answered instantly" />
            <Big value={handoffs} label="passed to the team" />
          </Panel>
        </div>
      </div>
    </main>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-5 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Big({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3 last:mb-0">
      <span className="min-w-14 text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-[15px] text-stone-600">{label}</span>
    </div>
  );
}

const EmptyNote = () => <p className="text-stone-500">No data yet. Try “Simulate visitors”.</p>;
