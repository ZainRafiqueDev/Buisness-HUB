import Link from "next/link";
import { BUSINESSES, platformLabel } from "@/lib/businesses";
import { WORKFLOWS } from "@/lib/workflows";
import type { Platform } from "@/lib/types";

const JOURNEY = ["Visitor lands on the website", "AI assistant or quiz guides them", "Lead saved in the CRM", "Books or buys", "Automations follow up"];

export default function Hub() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Connected Business Hub</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">One customer journey, set up for three different businesses.</h1>
        <p className="mt-5 text-lg text-stone-600">
          The same engine runs a coaching business, a wellness studio and an online store. Each one uses its own tools
          (Shopify, Kajabi, HubSpot, GoHighLevel, Klaviyo, Stripe and more), and the workflows stay the same.
        </p>
      </div>

      <ol className="mt-10 grid gap-3 sm:grid-cols-5">
        {JOURNEY.map((step, i) => (
          <li key={step} className="card flex items-start gap-3 p-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stone-900 text-sm font-bold text-white">{i + 1}</span>
            <span className="text-[15px] font-medium leading-snug">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {BUSINESSES.map((b) => (
          <article key={b.id} className="card flex flex-col overflow-hidden" style={{ "--accent": b.accent, "--accent-soft": b.accentSoft } as React.CSSProperties}>
            <div className="bg-accent-soft p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-lg font-bold text-white">{b.initial}</span>
                <div>
                  <h2 className="text-xl font-bold">{b.name}</h2>
                  <p className="text-sm text-stone-600">{b.industry}</p>
                </div>
              </div>
              <p className="mt-4 text-[15px] text-stone-700">{b.hero.title}</p>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Tools connected</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(Object.keys(b.stack) as Platform[])
                  .filter((p) => p !== "assistant")
                  .map((p) => (
                    <span key={p} className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-sm font-medium">
                      {platformLabel(b, p)}
                    </span>
                  ))}
              </div>
              <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-stone-500">{b.workflows.length} automations</h3>
              <ul className="mt-2 flex-1 space-y-1 text-[15px] text-stone-700">
                {b.workflows.slice(0, 5).map((w) => (
                  <li key={w}>• {WORKFLOWS[w].name}</li>
                ))}
                {b.workflows.length > 5 && <li className="text-stone-500">+ {b.workflows.length - 5} more</li>}
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link href={`/${b.id}`} className="btn">Website</Link>
                <Link href={`/${b.id}/crm`} className="btn-ghost">CRM</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
