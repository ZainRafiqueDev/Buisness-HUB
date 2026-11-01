import { NextResponse } from "next/server";
import { getBusiness, slotsForNextDays } from "@/lib/businesses";
import { runAction } from "@/lib/engine";
import { nowIso, readDB } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ biz: string; action: string }> };

const isEmail = (v: unknown) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const NEEDS_EMAIL = new Set(["lead", "quiz", "book", "checkout"]);

export async function GET(_req: Request, { params }: Params) {
  const { biz, action } = await params;
  if (action !== "state" || !getBusiness(biz)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = await readDB(biz);
  const taken = new Set(db.bookings.filter((b) => b.status === "upcoming").map((b) => b.slot));
  return NextResponse.json({ ...db, now: nowIso(db), slots: slotsForNextDays().filter((s) => !taken.has(s)) });
}

export async function POST(req: Request, { params }: Params) {
  const { biz, action } = await params;
  const input = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (NEEDS_EMAIL.has(action) && !isEmail(input.email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (action === "chat" && !String(input.message ?? "").trim()) {
    return NextResponse.json({ error: "Please type a question." }, { status: 400 });
  }
  try {
    return NextResponse.json(await runAction(biz, action, input));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Something went wrong" }, { status: 400 });
  }
}
