import { captureLead } from "@/lib/automation";
import { bad, handle, isEmail } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await req.json();
  if (!isEmail(body.email)) return bad("Please enter a valid email");
  return handle(() =>
    captureLead({
      name: String(body.name ?? ""),
      email: body.email,
      interest: String(body.interest ?? "general"),
      source: String(body.source ?? "website form"),
      consent: Boolean(body.consent),
    }),
  );
}
