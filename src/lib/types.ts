export type Platform = "website" | "ai-assistant" | "crm" | "booking" | "shopify" | "kajabi" | "email";

export type LeadStatus = "new" | "engaged" | "booked" | "customer";

export interface Lead {
  id: string;
  name: string;
  email: string;
  interest: string;
  source: string;
  status: LeadStatus;
  tags: string[];
  consent: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  leadId: string;
  slot: string;
  service: string;
  createdAt: string;
}

export interface Order {
  id: string;
  leadId: string;
  sku: string;
  title: string;
  kind: "product" | "course";
  amount: number;
  createdAt: string;
}

export interface AutomationEvent {
  id: string;
  leadId?: string;
  platform: Platform;
  type: string;
  summary: string;
  simulated: boolean;
  status: "done" | "scheduled";
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface DB {
  leads: Lead[];
  bookings: Booking[];
  orders: Order[];
  events: AutomationEvent[];
}
