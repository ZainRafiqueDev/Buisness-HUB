// Sample business: "Northlight Coaching" — fictional, used only for this demo.

export const BUSINESS = {
  name: "Northlight Coaching",
  tagline: "Coaching, courses and tools for calmer, more focused work.",
};

export const SERVICES = [
  { id: "discovery", title: "Free 20-min discovery call", price: 0, minutes: 20 },
  { id: "coaching", title: "1:1 coaching session", price: 120, minutes: 60 },
];

export const CATALOG = [
  {
    sku: "course-focus",
    title: "Focus Reset — 4-week online course",
    kind: "course" as const,
    price: 149,
    platform: "kajabi" as const,
    blurb: "Video lessons, worksheets and a weekly live Q&A.",
  },
  {
    sku: "course-starter",
    title: "Mindful Mornings — mini course",
    kind: "course" as const,
    price: 39,
    platform: "kajabi" as const,
    blurb: "Seven short lessons to build a morning routine.",
  },
  {
    sku: "prod-journal",
    title: "Northlight Planner (printed)",
    kind: "product" as const,
    price: 32,
    platform: "shopify" as const,
    blurb: "12-week guided planner, shipped worldwide.",
  },
];

export function slotsForNextDays(days = 5) {
  const out: string[] = [];
  const now = new Date();
  for (let d = 1; out.length < days * 3; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    for (const h of [10, 13, 16]) {
      const s = new Date(day);
      s.setHours(h, 0, 0, 0);
      out.push(s.toISOString());
    }
  }
  return out;
}
