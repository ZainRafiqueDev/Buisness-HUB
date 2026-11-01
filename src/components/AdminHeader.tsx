"use client";

import { useState } from "react";
import { act, clearVisitor, type State } from "@/lib/client";

// Shared toolbar for the admin screens: populate activity, move time forward, start over.
export default function AdminHeader({ biz, title, text, state, refresh }: { biz: string; title: string; text: string; state?: State; refresh: () => void }) {
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  async function run(name: string, action: string, body: object = {}) {
    setBusy(name);
    setNote("");
    try {
      const r = await act<{ sent?: number; added?: number }>(biz, action, body);
      if (action === "advance") setNote(`${r.sent} scheduled message${r.sent === 1 ? "" : "s"} sent`);
      if (action === "simulate") setNote(`${r.added} new visitors played through the site`);
      if (action === "reset") clearVisitor(biz);
      refresh();
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-lg text-stone-600">{text}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {note && <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">{note}</span>}
        {state && state.clockDays > 0 && <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold">Day +{state.clockDays}</span>}
        <button className="btn-ghost btn-sm" disabled={!!busy} onClick={() => run("sim", "simulate")}>
          {busy === "sim" ? "Running…" : "▶ Simulate visitors"}
        </button>
        <button className="btn-ghost btn-sm" disabled={!!busy} onClick={() => run("adv", "advance", { days: 1 })}>
          ⏩ Skip ahead 1 day
        </button>
        <button
          className="btn-ghost btn-sm"
          disabled={!!busy}
          onClick={() => {
            if (confirm("Clear all contacts, orders and activity for this business?")) run("reset", "reset");
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
