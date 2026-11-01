import { purchase } from "@/lib/automation";
import { bad, handle, isEmail } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await req.json();
  if (!isEmail(body.email)) return bad("Please enter a valid email");
  return handle(() => purchase({ name: String(body.name ?? ""), email: body.email, sku: String(body.sku) }));
}
