"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Website" },
  { href: "/dashboard", label: "CRM & automations" },
  { href: "/architecture", label: "How it connects" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-700 text-xs text-white">N</span>
          Northlight
        </Link>
        <nav className="flex gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 ${path === l.href ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
