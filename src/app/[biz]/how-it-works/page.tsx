import { notFound } from "next/navigation";
import PlatformBadge from "@/components/PlatformBadge";
import { BUSINESSES, getBusiness, platformLabel } from "@/lib/businesses";
import { WORKFLOWS } from "@/lib/workflows";

const PHASES = [
  ["1. Review", "Code, security, hosting and accounts checked. Launch blockers listed. Firm quote."],
  ["2. Go live", "Deployment, domain, Cloudflare DNS and SSL, staging copy for safe changes."],
  ["3. Connect", "Booking, store, CRM and courses connected one at a time, each tested end to end."],
  ["4. Grow", "Funnels, email and SMS flows, AI assistant, SEO and AI-search tracking."],
];

export default async function HowItWorks({ params }: { params: Promise<{ biz: string }> }) {
  const { biz: id } = await params;
  const biz = getBusiness(id);
  if (!biz) notFound();
  const others = BUSINESSES.filter((b) => b.id !== biz.id);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-bold">How {biz.name} connects</h1>
      <p className="mt-2 max-w-3xl text-lg text-stone-600">
        The website is the front door. Every action becomes one event that updates the CRM and starts the next step,
        so customers never feel the switch between tools.
      </p>

      <h2 className="mt-10 text-xl font-bold">Tools and how each one is connected</h2>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="border-b border-stone-200 bg-stone-50 text-sm text-stone-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Tool</th>
              <th className="px-5 py-3 font-semibold">Connection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {biz.connections.map((c) => (
              <tr key={c.platform}>
                <td className="px-5 py-4"><PlatformBadge biz={biz} p={c.platform} /></td>
                <td className="px-5 py-4 text-[15px] text-stone-700">{c.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-bold">Key journeys</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        {biz.workflows.filter((w) => ["booking-confirm", "abandoned-checkout", "course-enroll", "membership", "lead-scoring"].includes(w)).slice(0, 3).map((w) => {
          const wf = WORKFLOWS[w];
          return (
            <div key={w} className="card p-6">
              <p className="label">When</p>
              <p className="mt-1 text-lg font-semibold">{wf.trigger}</p>
              <ol className="mt-4 space-y-3">
                {wf.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[15px]">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      <h2 className="mt-12 text-xl font-bold">Same engine, different tools</h2>
      <p className="mt-2 text-stone-600">The workflows stay the same. Only the connectors change for each business.</p>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="border-b border-stone-200 bg-stone-50 text-sm text-stone-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Role</th>
              {[biz, ...others].map((b) => (
                <th key={b.id} className={`px-5 py-3 font-semibold ${b.id === biz.id ? "text-stone-900" : ""}`}>{b.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(["crm", "booking", "store", "courses", "payments", "email", "sms"] as const).map((p) => (
              <tr key={p}>
                <td className="px-5 py-3 font-medium capitalize">{p === "store" ? "Store" : p === "sms" ? "SMS" : p}</td>
                {[biz, ...others].map((b) => (
                  <td key={b.id} className={`px-5 py-3 ${b.id === biz.id ? "font-semibold" : "text-stone-600"}`}>{b.stack[p] ? platformLabel(b, p) : "–"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-bold">Delivery in phases</h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-4">
        {PHASES.map(([t, d]) => (
          <li key={t} className="card p-5">
            <div className="text-lg font-bold">{t}</div>
            <div className="mt-1 text-[15px] text-stone-600">{d}</div>
          </li>
        ))}
      </ol>
    </main>
  );
}
