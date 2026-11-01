import { NextResponse } from "next/server";

export const isEmail = (v: unknown): v is string => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function handle<T>(fn: () => Promise<T>) {
  try {
    return NextResponse.json(await fn());
  } catch (e) {
    return bad(e instanceof Error ? e.message : "Something went wrong");
  }
}
