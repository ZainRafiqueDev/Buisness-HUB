import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Connected Business Hub — Demo",
  description: "Demo: website, AI assistant, booking, commerce, courses and CRM automation as one customer journey.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">
          Demo with sample data. The website, assistant and CRM run live here; Shopify, Kajabi, booking and email
          are simulated with real-world event shapes.
        </div>
        <Nav />
        {children}
      </body>
    </html>
  );
}
