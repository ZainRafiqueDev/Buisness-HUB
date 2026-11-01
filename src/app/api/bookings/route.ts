import { createBooking } from "@/lib/automation";
import { bad, handle, isEmail } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await req.json();
  if (!isEmail(body.email)) return bad("Please enter a valid email");
  if (!body.slot) return bad("Please pick a time");
  return handle(() =>
    createBooking({
      name: String(body.name ?? ""),
      email: body.email,
      slot: String(body.slot),
      service: String(body.service ?? "discovery"),
      consent: Boolean(body.consent),
    }),
  );
}
