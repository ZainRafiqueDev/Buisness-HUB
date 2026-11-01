"use client";

import { useState } from "react";
import PlatformBadge from "./PlatformBadge";
import type { Business } from "@/lib/businesses";
import { fmtDate, timeAgo } from "@/lib/client";
import type { AutomationEvent } from "@/lib/types";
import { WORKFLOWS } from "@/lib/workflows";

export default function EventRow({ biz, e, now, leadName }: { biz: Business; e: AutomationEvent; now: string; leadName?: string }) {
  const [open, setOpen] = useState(false);
  const scheduled = e.status === "scheduled";
  return (
    <li className={`px-5 py-4 ${scheduled ? "bg-stone-50/70" : ""}`}>
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge biz={biz} p={e.platform} />
          {e.workflow && <span className="text-sm text-stone-500">{WORKFLOWS[e.workflow]?.name}</span>}
          <span className="ml-auto text-sm text-stone-500">
            {scheduled ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-900">⏱ Sends {fmtDate(e.dueAt!)}</span>
            ) : (
              timeAgo(e.createdAt, now)
            )}
          </span>
        </div>
        <div className={`mt-1.5 text-[15px] leading-snug ${scheduled ? "text-stone-600" : "text-stone-900"}`}>{e.summary}</div>
        {leadName && <div className="mt-0.5 text-sm text-stone-500">{leadName}</div>}
      </button>
      {open && (
        <div className="mt-3">
          <div className="mb-1 font-mono text-xs text-stone-500">{e.type}</div>
          <pre className="overflow-x-auto rounded-xl bg-stone-900 p-4 font-mono text-[13px] leading-relaxed text-stone-100">{JSON.stringify(e.payload, null, 2)}</pre>
        </div>
      )}
    </li>
  );
}
