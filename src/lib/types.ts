export type Platform =
  | "website"
  | "assistant"
  | "crm"
  | "booking"
  | "store"
  | "courses"
  | "email"
  | "sms"
  | "payments"
  | "team";

export type LeadStatus = "new" | "engaged" | "booked" | "customer";

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: LeadStatus;
  tags: string[];
  consent: boolean;
  score: number;
  value: number;
  createdAt: string;
  lastActivity: string;
}

export interface Booking {
  id: string;
  leadId: string;
  slot: string;
  service: string;
  status: "upcoming" | "completed";
  createdAt: string;
}

export interface Order {
  id: string;
  leadId: string;
  sku: string;
  title: string;
  kind: ItemKind;
  amount: number;
  createdAt: string;
}

export interface Checkout {
  id: string;
  leadId: string;
  sku: string;
  status: "open" | "paid";
  createdAt: string;
}

export interface AutomationEvent {
  id: string;
  leadId?: string;
  platform: Platform;
  workflow?: string;
  type: string;
  summary: string;
  status: "done" | "scheduled";
  dueAt?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface DB {
  leads: Lead[];
  bookings: Booking[];
  orders: Order[];
  checkouts: Checkout[];
  events: AutomationEvent[];
  disabled: string[];
  clockDays: number;
}

export type ItemKind = "course" | "product" | "membership";
