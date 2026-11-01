import Landing, { type LandingStats } from "@/components/Landing";
import { BUSINESSES } from "@/lib/businesses";
import { runAction } from "@/lib/engine";
import { hasDB, readDB } from "@/lib/store";

export const dynamic = "force-dynamic";

// Totals across every business, so the landing page numbers match what the CRMs show.
async function loadStats(): Promise<LandingStats> {
  const dbs = await Promise.all(
    BUSINESSES.map(async (b) => {
      if (!(await hasDB(b.id))) await runAction(b.id, "reset", {});
      return readDB(b.id);
    }),
  );
  let contacts = 0, revenue = 0, messages = 0, bookings = 0;
  dbs.forEach((db, i) => {
    const biz = BUSINESSES[i];
    contacts += db.leads.length;
    bookings += db.bookings.length;
    revenue += db.orders.reduce((n, o) => n + o.amount, 0);
    revenue += db.bookings.filter((x) => x.status === "completed").reduce((n, x) => n + (biz.services.find((s) => s.id === x.service)?.price ?? 0), 0);
    messages += db.events.filter((e) => (e.platform === "email" || e.platform === "sms") && e.status === "done" && (e.type.endsWith("queued") || e.type === "email.sent")).length;
  });
  return { contacts, revenue, messages, bookings, workflows: new Set(BUSINESSES.flatMap((b) => b.workflows)).size };
}

export default async function Home() {
  return <Landing stats={await loadStats()} />;
}
