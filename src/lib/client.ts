"use client";

import { useCallback, useEffect, useState } from "react";
import type { DB } from "./types";

export type State = DB & { slots: string[]; now: string };

export async function act<T = unknown>(biz: string, action: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`/api/${biz}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const getState = (biz: string): Promise<State> => fetch(`/api/${biz}/state`, { cache: "no-store" }).then((r) => r.json());

// Polls the business state so admin screens update while the site is used in another tab.
export function useLiveState(biz: string, intervalMs = 2000) {
  const [state, setState] = useState<State>();
  const refresh = useCallback(() => getState(biz).then(setState).catch(() => {}), [biz]);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);
  return { state, refresh };
}

// The visitor's identity stays in the browser so every form and the assistant link to one CRM record.
export interface Visitor {
  leadId?: string;
  name: string;
  email: string;
}

const key = (biz: string) => `visitor:${biz}`;

export function loadVisitor(biz: string): Visitor {
  try {
    return { name: "", email: "", ...JSON.parse(localStorage.getItem(key(biz)) ?? "{}") };
  } catch {
    return { name: "", email: "" };
  }
}

export function saveVisitor(biz: string, v: Visitor) {
  try {
    localStorage.setItem(key(biz), JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new Event("visitor"));
}

export function clearVisitor(biz: string) {
  try {
    localStorage.removeItem(key(biz));
  } catch {}
}

export function useVisitor(biz: string) {
  const [v, setV] = useState<Visitor>({ name: "", email: "" });
  useEffect(() => {
    const sync = () => {
      setV(loadVisitor(biz));
    };
    sync();
    window.addEventListener("visitor", sync);
    return () => window.removeEventListener("visitor", sync);
  }, [biz]);
  return v;
}

export const fmtSlot = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function timeAgo(iso: string, now: string) {
  const s = Math.round((new Date(now).getTime() - new Date(iso).getTime()) / 1000);
  if (s < 0) return `in ${Math.max(1, Math.round(-s / 86400))}d`;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
