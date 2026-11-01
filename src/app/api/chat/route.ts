import { NextResponse } from "next/server";
import { answer } from "@/lib/assistant";
import { noteAssistant } from "@/lib/automation";

export async function POST(req: Request) {
  const { message, leadId } = (await req.json()) as { message?: string; leadId?: string };
  if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });
  const result = answer(message);
  await noteAssistant(leadId, message, result.source);
  return NextResponse.json(result);
}
