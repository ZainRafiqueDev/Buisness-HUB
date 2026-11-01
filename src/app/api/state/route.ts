import { NextResponse } from "next/server";
import { slotsForNextDays } from "@/lib/catalog";
import { readDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await readDB();
  const taken = new Set(db.bookings.map((b) => b.slot));
  return NextResponse.json({ ...db, slots: slotsForNextDays().filter((s) => !taken.has(s)) });
}
