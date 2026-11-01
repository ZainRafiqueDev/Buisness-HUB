import type { Platform } from "./types";

export interface WorkflowDef {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  platforms: Platform[];
}

// One shared library. Each business switches on the workflows it needs.
export const WORKFLOWS: Record<string, WorkflowDef> = {
  "lead-nurture": {
    id: "lead-nurture",
    name: "Welcome & nurture series",
    trigger: "New contact with marketing consent",
    steps: ["Send the free resource right away", "Day 2: a helpful story or tip", "Day 4: invitation to book or buy", "Stops as soon as they book or buy"],
    platforms: ["crm", "email"],
  },
  "lead-scoring": {
    id: "lead-scoring",
    name: "Lead scoring & hot-lead alert",
    trigger: "Every action on the site adds points",
    steps: ["Form +10, quiz +15, chat +5, checkout +20, booking +30", "Score reaches 40: tag as hot lead", "Notify the team so someone follows up personally"],
    platforms: ["crm", "team"],
  },
  "booking-confirm": {
    id: "booking-confirm",
    name: "Booking confirmation & reminders",
    trigger: "Appointment booked",
    steps: ["Collect deposit where required", "Send confirmation with calendar invite", "Reminder 24 hours before", "Move contact to Booked in the pipeline"],
    platforms: ["booking", "payments", "email", "sms", "crm"],
  },
  "post-session": {
    id: "post-session",
    name: "After-visit follow-up",
    trigger: "Session marked as completed",
    steps: ["Thank-you message the same day", "Day 2: ask for a review", "Day 21: invite them to book again"],
    platforms: ["email", "sms", "crm"],
  },
  "course-enroll": {
    id: "course-enroll",
    name: "Course enrollment & onboarding",
    trigger: "Course purchased",
    steps: ["Grant course access automatically", "Send login details", "Day 2: nudge if lesson 1 not started", "Day 4: invite to the live Q&A"],
    platforms: ["store", "courses", "email"],
  },
  "order-followup": {
    id: "order-followup",
    name: "Order fulfilment & post-purchase",
    trigger: "Product order paid",
    steps: ["Send to fulfilment", "Thank-you and what to expect", "Day 10: ask for a product review", "Day 30: suggest a related product"],
    platforms: ["store", "email"],
  },
  "abandoned-checkout": {
    id: "abandoned-checkout",
    name: "Abandoned checkout recovery",
    trigger: "Checkout started but not paid",
    steps: ["Day 1: reminder with the cart link", "Day 2: small incentive to finish", "Cancelled automatically if they pay"],
    platforms: ["store", "email"],
  },
  membership: {
    id: "membership",
    name: "Membership billing",
    trigger: "Membership purchased",
    steps: ["Create the monthly subscription", "Tag as member and send the welcome", "Renewal scheduled every 30 days"],
    platforms: ["payments", "crm", "email"],
  },
  vip: {
    id: "vip",
    name: "VIP customer recognition",
    trigger: "Customer spends $150 or more in total",
    steps: ["Tag as VIP", "Notify the team", "Send a personal thank-you with early access"],
    platforms: ["crm", "team", "email"],
  },
  "ai-handoff": {
    id: "ai-handoff",
    name: "AI assistant handoff",
    trigger: "Assistant cannot answer from approved content",
    steps: ["Tell the visitor a person will reply", "Create a follow-up task for the team", "Log the question to improve the knowledge base"],
    platforms: ["assistant", "team"],
  },
};
