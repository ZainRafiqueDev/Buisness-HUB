"use client";

import { useParams } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import PlatformBadge from "@/components/PlatformBadge";
import { getBusiness } from "@/lib/businesses";
import { act, useLiveState } from "@/lib/client";
import { WORKFLOWS } from "@/lib/workflows";

export default function Automations() {
  const { biz: id } = useParams<{ biz: string }>();
  const biz = getBusiness(id)!;
  const { state: s, refresh } = useLiveState(id);

  async function toggle(workflow: string) {
    await act(id, "toggle", { workflow });
    refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <AdminHeader biz={id} title="Automations" text="Each workflow runs by itself once it's switched on. Turn one off and the site keeps working without it." state={s} refresh={refresh} />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {biz.workflows.map((wid) => {
          const wf = WORKFLOWS[wid];
          const enabled = !s?.disabled.includes(wid);
          const runs = s?.events.filter((e) => e.workflow === wid && e.status === "done").length ?? 0;
          const queued = s?.events.filter((e) => e.workflow === wid && e.status === "scheduled").length ?? 0;
          return (
            <article key={wid} className={`card flex flex-col p-6 transition ${enabled ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{wf.name}</h2>
                <button
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Turn ${wf.name} ${enabled ? "off" : "on"}`}
                  onClick={() => toggle(wid)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-accent" : "bg-stone-300"}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? "left-6" : "left-1"}`} />
                </button>
              </div>
              <div className="mt-3 rounded-xl bg-accent-soft px-4 py-2.5 text-[15px]">
                <span className="font-semibold">When: </span>
                {wf.trigger}
              </div>
              <ol className="mt-4 flex-1 space-y-2">
                {wf.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-stone-700">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-900 text-xs font-bold text-white">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {wf.platforms.filter((p) => biz.stack[p]).map((p) => (
                  <PlatformBadge key={p} biz={biz} p={p} />
                ))}
              </div>
              <div className="mt-4 flex gap-4 border-t border-stone-100 pt-4 text-sm text-stone-600">
                <span><strong className="text-stone-900">{runs}</strong> actions run</span>
                <span><strong className="text-stone-900">{queued}</strong> scheduled</span>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
