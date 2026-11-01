"use client";

import type { DB } from "./types";

export type State = DB & { slots: string[] };

export async function post<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const getState = (): Promise<State> => fetch("/api/state", { cache: "no-store" }).then((r) => r.json());

// The visitor's identity stays in the browser so forms and the assistant link to the same CRM record.
export interface Visitor {
  leadId?: string;
  name: string;
  email: string;
}

export function loadVisitor(): Visitor {
  try {
    return JSON.parse(localStorage.getItem("visitor") ?? "") as Visitor;
  } catch {
    return { name: "", email: "" };
  }
}

export function saveVisitor(v: Visitor) {
  try {
    localStorage.setItem("visitor", JSON.stringify(v));
    window.dispatchEvent(new Event("visitor"));
  } catch {}
}

export const fmtSlot = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const timeAgo = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
};
