// A deterministic retrieval assistant so the live demo never goes off-script.
// Production swaps `answer()` for an LLM call with the same knowledge base as
// retrieved context and the same actions exposed as tools.

export type AssistantAction =
  | { type: "offer_booking" }
  | { type: "capture_lead"; interest: string }
  | { type: "recommend"; sku: string }
  | { type: "handoff" };

interface Doc {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
  actions?: AssistantAction[];
}

const KB: Doc[] = [
  {
    id: "pricing",
    title: "Pricing",
    keywords: ["price", "cost", "how much", "expensive", "fee", "pricing", "pay"],
    answer:
      "1:1 coaching is $120 per 60-minute session. The Focus Reset course is $149 and Mindful Mornings is $39. The 20-minute discovery call is free.",
    actions: [{ type: "offer_booking" }],
  },
  {
    id: "which-course",
    title: "Course comparison",
    keywords: ["which course", "course", "courses", "right for me", "difference", "learn", "beginner", "start"],
    answer:
      "If you're new, Mindful Mornings ($39) is a 7-lesson starter. If you want a full reset of how you plan and focus, Focus Reset ($149) runs 4 weeks with worksheets and a weekly live Q&A.",
    actions: [{ type: "recommend", sku: "course-focus" }, { type: "capture_lead", interest: "course" }],
  },
  {
    id: "booking",
    title: "Booking",
    keywords: ["book", "booking", "appointment", "call", "schedule", "session", "consultation", "available", "availability"],
    answer: "You can book a free 20-minute discovery call or a full coaching session. Here are the next open times:",
    actions: [{ type: "offer_booking" }],
  },
  {
    id: "refund",
    title: "Refund policy",
    keywords: ["refund", "money back", "cancel", "cancellation", "guarantee"],
    answer:
      "Courses have a 14-day refund if you've completed less than 2 lessons. Sessions can be rescheduled or cancelled free up to 24 hours before.",
  },
  {
    id: "access",
    title: "Course access",
    keywords: ["login", "log in", "access", "password", "where is my course", "kajabi"],
    answer:
      "After purchase you get an email with your login to the course area. Access is lifetime, including future updates.",
  },
  {
    id: "shipping",
    title: "Shipping",
    keywords: ["ship", "shipping", "delivery", "planner", "order", "track"],
    answer: "The printed planner ships worldwide in 3–7 business days. You'll get a tracking link by email.",
    actions: [{ type: "recommend", sku: "prod-journal" }],
  },
  {
    id: "about",
    title: "About",
    keywords: ["who", "about", "coach", "experience", "help with", "what do you do"],
    answer:
      "Northlight helps busy professionals plan calmer weeks and focus on what matters, through 1:1 coaching, online courses and a guided planner.",
    actions: [{ type: "capture_lead", interest: "coaching" }],
  },
];

export interface AssistantReply {
  reply: string;
  source: string;
  confidence: number;
  actions: AssistantAction[];
}

export function answer(question: string): AssistantReply {
  const q = question.toLowerCase();
  let best: Doc | undefined;
  let bestScore = 0;
  for (const doc of KB) {
    const score = doc.keywords.reduce((s, k) => (q.includes(k) ? s + k.split(" ").length : s), 0);
    if (score > bestScore) {
      best = doc;
      bestScore = score;
    }
  }
  if (!best) {
    return {
      reply:
        "I'm not certain about that one, and I'd rather not guess. I can pass your question to the team. Leave your email and someone will reply within a business day.",
      source: "human handoff",
      confidence: 0,
      actions: [{ type: "handoff" }, { type: "capture_lead", interest: "question" }],
    };
  }
  return {
    reply: best.answer,
    source: best.title,
    confidence: Math.min(1, bestScore / 2),
    actions: best.actions ?? [],
  };
}
