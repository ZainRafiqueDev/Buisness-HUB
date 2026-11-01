import { platformLabel, type Business } from "@/lib/businesses";
import type { Platform } from "@/lib/types";

export const PLATFORM_STYLE: Record<Platform, string> = {
  website: "bg-stone-100 text-stone-800",
  assistant: "bg-amber-100 text-amber-900",
  crm: "bg-emerald-100 text-emerald-900",
  booking: "bg-blue-100 text-blue-900",
  store: "bg-lime-100 text-lime-900",
  courses: "bg-violet-100 text-violet-900",
  email: "bg-pink-100 text-pink-900",
  sms: "bg-cyan-100 text-cyan-900",
  payments: "bg-indigo-100 text-indigo-900",
  team: "bg-orange-100 text-orange-900",
};

export default function PlatformBadge({ biz, p }: { biz: Business; p: Platform }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLATFORM_STYLE[p]}`}>
      {platformLabel(biz, p)}
    </span>
  );
}
