import type { ItemKind, Platform } from "./types";

export type AssistantAction =
  | { type: "offer_booking" }
  | { type: "capture_lead"; interest: string }
  | { type: "recommend"; sku: string }
  | { type: "handoff" };

export interface KnowledgeDoc {
  title: string;
  keywords: string[];
  answer: string;
  actions?: AssistantAction[];
}

export interface Item {
  sku: string;
  title: string;
  kind: ItemKind;
  price: number;
  blurb: string;
  badge: string;
}

export interface Service {
  id: string;
  title: string;
  price: number;
  minutes: number;
  deposit?: number;
}

export interface QuizResult {
  label: string;
  text: string;
  sku?: string;
  service?: string;
}

export interface Business {
  id: string;
  name: string;
  initial: string;
  industry: string;
  accent: string;
  accentSoft: string;
  hero: { eyebrow: string; title: string; sub: string; primary: string; secondary: string };
  stats: { value: string; label: string }[];
  testimonials: { quote: string; name: string }[];
  leadMagnet: { eyebrow: string; title: string; text: string; cta: string; success: string };
  booking: { title: string; text: string };
  services: Service[];
  shop: { title: string; text: string };
  catalog: Item[];
  quiz: { title: string; text: string; question: string; options: { label: string; result: string }[]; results: Record<string, QuizResult> };
  starters: string[];
  kb: KnowledgeDoc[];
  stack: Partial<Record<Platform, string>>;
  connections: { platform: Platform; how: string }[];
  workflows: string[];
  copy: { nurture: string[]; courseOnboarding: string[]; postPurchase: string[]; abandoned: string[]; review: string; rebook: string };
}

const northlight: Business = {
  id: "northlight",
  name: "Northlight Coaching",
  initial: "N",
  industry: "Coaching & online courses",
  accent: "#0f766e",
  accentSoft: "#ecfdf5",
  hero: {
    eyebrow: "Coaching · Courses · Tools",
    title: "Plan calmer weeks. Focus on what matters.",
    sub: "1:1 coaching, self-paced courses and a guided planner for busy professionals.",
    primary: "Book a free discovery call",
    secondary: "Explore courses",
  },
  stats: [
    { value: "1,200+", label: "students enrolled" },
    { value: "4.9/5", label: "average session rating" },
    { value: "20 min", label: "free discovery call" },
  ],
  testimonials: [
    { quote: "I finally stopped carrying my to-do list around in my head. Mondays feel different now.", name: "Priya, product manager" },
    { quote: "The Focus Reset course paid for itself in the first week.", name: "Daniel, agency owner" },
  ],
  leadMagnet: {
    eyebrow: "Free download",
    title: "The 10-minute Weekly Focus Checklist",
    text: "The same checklist our clients use every Monday morning.",
    cta: "Send me the checklist",
    success: "Check your inbox. Your checklist is on its way.",
  },
  booking: { title: "Book a session", text: "Pick a time that suits you. Confirmation and a reminder arrive by email." },
  services: [
    { id: "discovery", title: "Free discovery call", price: 0, minutes: 20 },
    { id: "coaching", title: "1:1 coaching session", price: 120, minutes: 60 },
  ],
  shop: { title: "Courses & tools", text: "Courses open instantly in the member area. The planner ships worldwide." },
  catalog: [
    { sku: "course-focus", title: "Focus Reset", kind: "course", price: 149, badge: "4-week course", blurb: "Video lessons, worksheets and a weekly live Q&A." },
    { sku: "course-mornings", title: "Mindful Mornings", kind: "course", price: 39, badge: "Mini course", blurb: "Seven short lessons to build a morning routine that sticks." },
    { sku: "planner", title: "Northlight Planner", kind: "product", price: 32, badge: "Printed planner", blurb: "A 12-week guided planner, shipped to your door." },
  ],
  quiz: {
    title: "Not sure where to start?",
    text: "Answer one question and we'll point you to the right next step.",
    question: "What would help you most right now?",
    options: [
      { label: "A clear system for planning my week", result: "focus" },
      { label: "A calmer, more consistent morning", result: "mornings" },
      { label: "Personal guidance for a big decision", result: "coaching" },
    ],
    results: {
      focus: { label: "Focus Reset", text: "Our 4-week course builds a weekly planning system you'll actually keep.", sku: "course-focus" },
      mornings: { label: "Mindful Mornings", text: "Seven short lessons, ten minutes a day. A gentle place to start.", sku: "course-mornings" },
      coaching: { label: "1:1 coaching", text: "Start with a free 20-minute discovery call to see if coaching is right for you.", service: "discovery" },
    },
  },
  starters: ["Which course is right for me?", "How much is coaching?", "Can I book a call this week?"],
  kb: [
    { title: "Pricing", keywords: ["price", "cost", "how much", "fee", "pricing", "expensive"], answer: "1:1 coaching is $120 per 60-minute session. Focus Reset is $149 and Mindful Mornings is $39. The 20-minute discovery call is free.", actions: [{ type: "offer_booking" }] },
    { title: "Course comparison", keywords: ["which course", "course", "courses", "right for me", "difference", "beginner", "start"], answer: "If you're new, Mindful Mornings ($39) is a 7-lesson starter. For a full reset of how you plan and focus, Focus Reset ($149) runs 4 weeks with worksheets and a weekly live Q&A.", actions: [{ type: "recommend", sku: "course-focus" }, { type: "capture_lead", interest: "course" }] },
    { title: "Booking", keywords: ["book", "booking", "appointment", "call", "schedule", "session", "available", "availability"], answer: "You can book a free 20-minute discovery call or a full coaching session. Here are the next open times:", actions: [{ type: "offer_booking" }] },
    { title: "Refund policy", keywords: ["refund", "money back", "cancel", "guarantee"], answer: "Courses have a 14-day refund if you've completed fewer than 2 lessons. Sessions can be moved or cancelled free up to 24 hours before." },
    { title: "Course access", keywords: ["login", "log in", "access", "password", "where is my course"], answer: "Right after purchase you get an email with your login to the member area. Access is lifetime, including future updates." },
    { title: "Shipping", keywords: ["ship", "shipping", "delivery", "planner", "track"], answer: "The printed planner ships worldwide in 3–7 business days, with a tracking link by email.", actions: [{ type: "recommend", sku: "planner" }] },
  ],
  stack: { crm: "HubSpot", booking: "Calendly", store: "Shopify", courses: "Kajabi", email: "HubSpot Email", payments: "Shopify Payments", team: "Slack", assistant: "AI assistant" },
  connections: [
    { platform: "website", how: "Custom site on its own domain, Cloudflare DNS and SSL" },
    { platform: "assistant", how: "LLM with retrieval over approved content; lead capture and booking as tools" },
    { platform: "crm", how: "HubSpot contacts API: upsert by email, tags, lifecycle stage" },
    { platform: "booking", how: "Calendly embed and invitee.created webhook" },
    { platform: "store", how: "Shopify Buy Button, orders/create webhook (HMAC verified)" },
    { platform: "courses", how: "Kajabi: grant offer on purchase through the API or Zapier" },
    { platform: "team", how: "Slack incoming webhook for hot leads and handoffs" },
  ],
  workflows: ["lead-nurture", "lead-scoring", "booking-confirm", "post-session", "course-enroll", "order-followup", "abandoned-checkout", "vip", "ai-handoff"],
  copy: {
    nurture: ["Your Weekly Focus Checklist", "How Priya got her Mondays back", "Ready for a calmer week? Book a free call"],
    courseOnboarding: ["Welcome! Here's how to log in", "Lesson 1 takes 12 minutes. Start today", "You're invited to Thursday's live Q&A"],
    postPurchase: ["Your planner is on its way", "3 ways to get the most from your planner", "Pair your planner with Focus Reset"],
    abandoned: ["You left something behind", "Still thinking? Here's 10% off to finish"],
    review: "How was your session? A 30-second review helps a lot",
    rebook: "Time for your next session? Pick a slot",
  },
};

const lumen: Business = {
  id: "lumen",
  name: "Lumen Wellness Studio",
  initial: "L",
  industry: "Wellness studio & memberships",
  accent: "#be185d",
  accentSoft: "#fdf2f8",
  hero: {
    eyebrow: "Massage · Facials · Yoga",
    title: "Slow down. You deserve an hour for yourself.",
    sub: "Award-winning treatments and small-group yoga in the heart of the city. Book online in under a minute.",
    primary: "Book a treatment",
    secondary: "See memberships",
  },
  stats: [
    { value: "8,500+", label: "treatments booked" },
    { value: "4.8/5", label: "from 600+ reviews" },
    { value: "7 days", label: "open every week" },
  ],
  testimonials: [
    { quote: "Booking took thirty seconds and the reminder text saved me. The massage was perfect.", name: "Hannah R." },
    { quote: "The membership is the best thing I do for myself every month.", name: "Marcus T." },
  ],
  leadMagnet: {
    eyebrow: "New here?",
    title: "15% off your first visit",
    text: "Join our list for your welcome offer and seasonal treatments.",
    cta: "Claim my 15% off",
    success: "Your code is on its way to your inbox.",
  },
  booking: { title: "Book your visit", text: "A $25 deposit holds your appointment. Text and email reminders included." },
  services: [
    { id: "massage", title: "Signature massage", price: 95, minutes: 60, deposit: 25 },
    { id: "facial", title: "Glow facial", price: 85, minutes: 50, deposit: 25 },
    { id: "consult", title: "Free skin consultation", price: 0, minutes: 15 },
  ],
  shop: { title: "Memberships & gifts", text: "Save on every visit, or treat someone you love." },
  catalog: [
    { sku: "membership", title: "Lumen Monthly", kind: "membership", price: 79, badge: "Membership · per month", blurb: "One treatment every month, 15% off extras and priority booking." },
    { sku: "yoga-pass", title: "10-class yoga pass", kind: "product", price: 150, badge: "Class pass", blurb: "Ten small-group classes, valid for six months." },
    { sku: "gift-card", title: "Gift card", kind: "product", price: 50, badge: "Digital gift card", blurb: "Delivered by email instantly. Never expires." },
  ],
  quiz: {
    title: "Find your treatment",
    text: "Tell us how you're feeling and we'll recommend where to start.",
    question: "What does your body need most this week?",
    options: [
      { label: "Release tension and stress", result: "massage" },
      { label: "Refresh and brighten my skin", result: "facial" },
      { label: "Regular self-care I'll stick to", result: "membership" },
    ],
    results: {
      massage: { label: "Signature massage", text: "60 minutes of deep relaxation, tailored to where you hold tension.", service: "massage" },
      facial: { label: "Glow facial", text: "A 50-minute facial matched to your skin on the day.", service: "facial" },
      membership: { label: "Lumen Monthly", text: "One treatment a month plus member pricing. Easy to keep up.", sku: "membership" },
    },
  },
  starters: ["What's included in the membership?", "Do I need a deposit?", "Can I book a massage this week?"],
  kb: [
    { title: "Membership", keywords: ["membership", "member", "monthly", "subscription", "included"], answer: "Lumen Monthly is $79/month: one 60-minute treatment every month, 15% off extras and priority booking. Cancel anytime with 30 days' notice.", actions: [{ type: "recommend", sku: "membership" }, { type: "capture_lead", interest: "membership" }] },
    { title: "Deposits", keywords: ["deposit", "pay upfront", "cancellation", "cancel", "no show", "reschedule"], answer: "A $25 deposit holds treatment bookings and comes off your bill. Free to reschedule up to 24 hours before; later cancellations keep the deposit." },
    { title: "Booking", keywords: ["book", "booking", "appointment", "available", "availability", "massage", "facial", "slot"], answer: "Happy to help. Here are the next open times:", actions: [{ type: "offer_booking" }] },
    { title: "Prices", keywords: ["price", "cost", "how much", "pricing"], answer: "Signature massage is $95 (60 min), Glow facial $85 (50 min), and skin consultations are free.", actions: [{ type: "offer_booking" }] },
    { title: "Location & parking", keywords: ["where", "location", "address", "parking", "park", "hours", "open"], answer: "We're open 7 days, 9am–8pm, with free parking behind the studio." },
    { title: "Gift cards", keywords: ["gift", "voucher", "present"], answer: "Digital gift cards are delivered by email instantly and never expire.", actions: [{ type: "recommend", sku: "gift-card" }] },
  ],
  stack: { crm: "GoHighLevel", booking: "Acuity", store: "Square Online", payments: "Stripe", email: "GoHighLevel Email", sms: "Twilio SMS", team: "Slack", assistant: "AI assistant" },
  connections: [
    { platform: "website", how: "Custom site on its own domain, Cloudflare DNS and SSL" },
    { platform: "assistant", how: "LLM with retrieval over services and policies; booking and lead capture as tools" },
    { platform: "crm", how: "GoHighLevel contacts and opportunities API, pipeline stages" },
    { platform: "booking", how: "Acuity scheduling API and appointment webhooks" },
    { platform: "payments", how: "Stripe Checkout for deposits; Stripe Billing for memberships" },
    { platform: "sms", how: "Twilio for reminders and review requests, with opt-out handling" },
    { platform: "team", how: "Slack alert for hot leads and VIP customers" },
  ],
  workflows: ["lead-nurture", "lead-scoring", "booking-confirm", "post-session", "membership", "order-followup", "abandoned-checkout", "vip", "ai-handoff"],
  copy: {
    nurture: ["Your 15% welcome code", "What to expect on your first visit", "This week's open slots are filling up"],
    courseOnboarding: [],
    postPurchase: ["Thank you! Your order is confirmed", "How to redeem it", "Members save 15%: see how"],
    abandoned: ["Your booking isn't finished yet", "Finish today and we'll add a free aromatherapy upgrade"],
    review: "How did you feel after your visit? Leave us a quick review",
    rebook: "It's been 3 weeks. Ready for your next treatment?",
  },
};

const ember: Business = {
  id: "ember",
  name: "Ember & Oak",
  initial: "E",
  industry: "E-commerce brand & subscriptions",
  accent: "#c2410c",
  accentSoft: "#fff7ed",
  hero: {
    eyebrow: "Hand-poured candles · Small batch",
    title: "Make every evening feel like a cabin weekend.",
    sub: "Natural soy candles poured by hand in small batches. Free shipping over $50.",
    primary: "Shop bestsellers",
    secondary: "Find your scent",
  },
  stats: [
    { value: "40k+", label: "candles shipped" },
    { value: "4.9/5", label: "from 2,300 reviews" },
    { value: "60 hrs", label: "average burn time" },
  ],
  testimonials: [
    { quote: "Fireside smells exactly like the lake house. I've reordered four times.", name: "Jess K." },
    { quote: "The monthly box is the best subscription I have.", name: "Tom W." },
  ],
  leadMagnet: {
    eyebrow: "Join the Ember Club",
    title: "10% off your first order",
    text: "Plus early access to seasonal scents before they sell out.",
    cta: "Get my 10% code",
    success: "Welcome to the club! Your code is in your inbox.",
  },
  booking: { title: "Planning an event?", text: "Custom candles for weddings and corporate gifts. Book a free 15-minute call." },
  services: [{ id: "custom", title: "Custom order call", price: 0, minutes: 15 }],
  shop: { title: "Bestsellers", text: "Free shipping on orders over $50. Ships within 2 business days." },
  catalog: [
    { sku: "fireside", title: "Fireside", kind: "product", price: 34, badge: "Cedar · smoke · amber", blurb: "Our bestseller. Warm, woody and a little smoky." },
    { sku: "gift-set", title: "Cabin Gift Set", kind: "product", price: 89, badge: "3 candles + matches", blurb: "Fireside, Pine Trail and Fig & Oak in a gift box." },
    { sku: "candle-club", title: "Candle of the Month", kind: "membership", price: 29, badge: "Subscription · per month", blurb: "A new seasonal scent every month. Skip or cancel anytime." },
  ],
  quiz: {
    title: "Find your scent",
    text: "One question, and we'll match you with a candle you'll love.",
    question: "Which evening sounds best?",
    options: [
      { label: "A crackling fire after a cold walk", result: "fireside" },
      { label: "Hosting friends and opening gifts", result: "gift" },
      { label: "Something new to look forward to every month", result: "club" },
    ],
    results: {
      fireside: { label: "Fireside", text: "Cedar, smoke and amber. Our most-loved candle.", sku: "fireside" },
      gift: { label: "Cabin Gift Set", text: "Three of our bestsellers in a ready-to-give box.", sku: "gift-set" },
      club: { label: "Candle of the Month", text: "A surprise seasonal scent at your door each month.", sku: "candle-club" },
    },
  },
  starters: ["How long does shipping take?", "Which candle is the bestseller?", "Do you do wedding favors?"],
  kb: [
    { title: "Shipping", keywords: ["ship", "shipping", "delivery", "arrive", "track", "how long"], answer: "Orders ship within 2 business days. US delivery takes 3–5 days, and shipping is free over $50." },
    { title: "Bestsellers", keywords: ["best", "bestseller", "popular", "recommend", "favorite", "which candle"], answer: "Fireside (cedar, smoke and amber) is our bestseller. If it's a gift, the Cabin Gift Set includes it with two other favourites.", actions: [{ type: "recommend", sku: "fireside" }, { type: "capture_lead", interest: "product" }] },
    { title: "Custom orders", keywords: ["wedding", "custom", "corporate", "bulk", "favor", "favour", "event", "wholesale"], answer: "Yes! We make custom candles for weddings and corporate gifts from 50 units. Book a free 15-minute call to plan yours:", actions: [{ type: "offer_booking" }] },
    { title: "Subscription", keywords: ["subscription", "monthly", "club", "skip", "cancel"], answer: "Candle of the Month is $29/month for a new seasonal scent. Skip or cancel anytime from your account.", actions: [{ type: "recommend", sku: "candle-club" }] },
    { title: "Returns", keywords: ["return", "refund", "broken", "damaged", "exchange"], answer: "If a candle arrives damaged we replace it free. Unused candles can be returned within 30 days." },
    { title: "Ingredients", keywords: ["soy", "wax", "ingredients", "natural", "toxic", "safe", "burn"], answer: "We use 100% soy wax, cotton wicks and phthalate-free fragrance oils. Average burn time is 60 hours." },
  ],
  stack: { crm: "Klaviyo", booking: "Cal.com", store: "Shopify", payments: "Shopify Payments", email: "Klaviyo", team: "Slack", assistant: "AI assistant" },
  connections: [
    { platform: "website", how: "Headless storefront on its own domain, Cloudflare DNS and SSL" },
    { platform: "assistant", how: "LLM with retrieval over products and policies; product recommendations as a tool" },
    { platform: "store", how: "Shopify Storefront API for cart; checkouts/create and orders/create webhooks" },
    { platform: "crm", how: "Klaviyo profiles, lists and events API" },
    { platform: "email", how: "Klaviyo flows: welcome, abandoned checkout, post-purchase, win-back" },
    { platform: "booking", how: "Cal.com embed for wholesale calls" },
    { platform: "team", how: "Slack alert for VIP customers and large orders" },
  ],
  workflows: ["lead-nurture", "lead-scoring", "booking-confirm", "order-followup", "abandoned-checkout", "membership", "vip", "ai-handoff"],
  copy: {
    nurture: ["Welcome to the Ember Club: your 10% code", "The story behind Fireside", "Your code expires soon"],
    courseOnboarding: [],
    postPurchase: ["Your candles are on the way", "How to get an even burn every time", "You might also love Pine Trail"],
    abandoned: ["Your candles are waiting in your cart", "Here's free shipping to finish your order"],
    review: "Loving your candle? Leave a quick review",
    rebook: "",
  },
};

export const BUSINESSES: Business[] = [northlight, lumen, ember];

export const getBusiness = (id: string) => BUSINESSES.find((b) => b.id === id);

export const PLATFORM_DEFAULT: Record<Platform, string> = {
  website: "Website",
  assistant: "AI assistant",
  crm: "CRM",
  booking: "Booking",
  store: "Store",
  courses: "Courses",
  email: "Email",
  sms: "SMS",
  payments: "Payments",
  team: "Team alert",
};

export const platformLabel = (b: Business, p: Platform) => b.stack[p] ?? PLATFORM_DEFAULT[p];

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
