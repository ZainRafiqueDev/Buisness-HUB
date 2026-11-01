import type { Platform } from "@/lib/types";

export const PLATFORM: Record<Platform, { label: string; cls: string }> = {
  website: { label: "Website", cls: "bg-stone-100 text-stone-700" },
  "ai-assistant": { label: "AI assistant", cls: "bg-amber-100 text-amber-800" },
  crm: { label: "CRM", cls: "bg-emerald-100 text-emerald-800" },
  booking: { label: "Booking", cls: "bg-blue-100 text-blue-800" },
  shopify: { label: "Shopify", cls: "bg-lime-100 text-lime-800" },
  kajabi: { label: "Kajabi", cls: "bg-violet-100 text-violet-800" },
  email: { label: "Email", cls: "bg-pink-100 text-pink-800" },
};

export default function PlatformBadge({ p }: { p: Platform }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PLATFORM[p].cls}`}>{PLATFORM[p].label}</span>;
}
