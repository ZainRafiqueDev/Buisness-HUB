import { notFound } from "next/navigation";
import AdminBar from "@/components/AdminBar";
import { BUSINESSES, getBusiness } from "@/lib/businesses";

export function generateStaticParams() {
  return BUSINESSES.map((b) => ({ biz: b.id }));
}

export default async function BusinessLayout({ children, params }: { children: React.ReactNode; params: Promise<{ biz: string }> }) {
  const { biz } = await params;
  const b = getBusiness(biz);
  if (!b) notFound();
  return (
    <div style={{ "--accent": b.accent, "--accent-soft": b.accentSoft } as React.CSSProperties}>
      <AdminBar biz={b.id} />
      {children}
    </div>
  );
}
