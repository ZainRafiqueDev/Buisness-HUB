import { NextResponse } from "next/server";
import { resetDB } from "@/lib/store";

export async function POST() {
  await resetDB();
  return NextResponse.json({ ok: true });
}
