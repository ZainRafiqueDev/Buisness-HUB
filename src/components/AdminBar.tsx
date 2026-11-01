"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BUSINESSES } from "@/lib/businesses";

const TABS = [
  { path: "", label: "Website" },
  { path: "/crm", label: "CRM" },
  { path: "/automations", label: "Automations" },
  { path: "/insights", label: "Insights" },
  { path: "/how-it-works", label: "How it connects" },
];

export default function AdminBar({ biz }: { biz: string }) {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="sticky top-0 z-40 bg-stone-900 text-stone-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5">
        <Link href="/" className="text-sm font-semibold text-stone-300 hover:text-white">
          ← All businesses
        </Link>
        <select
          value={biz}
          onChange={(e) => router.push(path.replace(`/${biz}`, `/${e.target.value}`))}
          className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-sm font-semibold text-white"
          aria-label="Switch business"
        >
          {BUSINESSES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <nav className="flex flex-wrap gap-1 sm:ml-auto">
          {TABS.map((t) => {
            const href = `/${biz}${t.path}`;
            const active = path === href;
            return (
              <Link
                key={t.path}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${active ? "bg-white text-stone-900" : "text-stone-300 hover:bg-stone-800 hover:text-white"}`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
