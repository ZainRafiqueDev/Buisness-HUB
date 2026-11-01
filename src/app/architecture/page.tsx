import PlatformBadge from "@/components/PlatformBadge";
import type { Platform } from "@/lib/types";

const FLOWS: { trigger: string; steps: { p: Platform; text: string }[] }[] = [
  {
    trigger: "Visitor downloads the checklist or chats with the assistant",
    steps: [
      { p: "crm", text: "Contact upserted by email (no duplicates)" },
      { p: "crm", text: "Tagged by interest" },
      { p: "email", text: "Welcome & nurture sequence starts, only with consent" },
    ],
  },
  {
    trigger: "Visitor books a call",
    steps: [
      { p: "booking", text: "invitee.created webhook received" },
      { p: "crm", text: "Status moved to booked, tag added" },
      { p: "email", text: "Nurture emails asking them to book are cancelled" },
      { p: "email", text: "Confirmation + reminder" },
    ],
  },
  {
    trigger: "Customer buys a course",
    steps: [
      { p: "shopify", text: "orders/create webhook (HMAC verified)" },
      { p: "kajabi", text: "Offer granted, so the student gets a login" },
      { p: "crm", text: "Status moved to customer" },
      { p: "email", text: "Course onboarding sequence" },
    ],
  },
];

const MAP = [
  ["Website", "Live (Next.js here)", "The existing Replit app on its own domain via Cloudflare DNS + SSL"],
  ["AI assistant", "Live, keyword retrieval", "LLM + retrieval over approved content; booking and lead capture exposed as tools; human handoff; monthly cost cap"],
  ["CRM", "Live, local store", "HubSpot / GoHighLevel / Kajabi CRM via API (upsert by email, tags, pipeline stage)"],
  ["Booking", "Simulated", "Calendly or Cal.com embed + invitee.created webhook"],
  ["Shopify", "Simulated", "Buy Button or Storefront API; checkout on Shopify; orders/create webhook"],
  ["Kajabi", "Simulated", "Grant offer via Kajabi API (plan-dependent) or Zapier/Make"],
  ["Email drips", "Simulated", "Sequences inside the CRM, with exit rules and consent"],
];

export default function Architecture() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">How it connects</h1>
      <p className="mt-1 max-w-2xl text-stone-600">
        The website is the front door. Every action becomes one event that updates the CRM and triggers the next step,
        so the customer never feels the handoff between platforms.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {FLOWS.map((f) => (
          <div key={f.trigger} className="card p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-stone-500">When</div>
            <div className="mt-1 font-semibold">{f.trigger}</div>
            <ol className="mt-4 space-y-3">
              {f.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-stone-900 text-[10px] text-white">{i + 1}</span>
                  <div className="space-y-1">
                    <PlatformBadge p={s.p} />
                    <div className="text-sm">{s.text}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Demo vs. production</h2>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">In this demo</th>
              <th className="px-4 py-3">In your project</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {MAP.map(([part, demo, prod]) => (
              <tr key={part}>
                <td className="px-4 py-3 font-medium">{part}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-1.5 py-0.5 text-xs ${demo.startsWith("Live") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{demo}</span>
                </td>
                <td className="px-4 py-3 text-stone-600">{prod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Delivery in phases</h2>
      <ol className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          ["1. Review", "Code, security, hosting, launch blockers, firm quote"],
          ["2. Go live", "Deployment, domain, Cloudflare, SSL, staging"],
          ["3. Connect", "Booking, Shopify, CRM, Kajabi, one at a time"],
          ["4. Grow", "Funnels, drips, AI assistant, SEO/AEO tracking"],
        ].map(([t, d]) => (
          <li key={t} className="card p-4">
            <div className="font-semibold">{t}</div>
            <div className="mt-1 text-sm text-stone-600">{d}</div>
          </li>
        ))}
      </ol>
    </main>
  );
}
