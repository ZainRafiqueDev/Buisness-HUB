import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Connected Business Hub",
  description: "One customer-journey platform: website, AI assistant, booking, commerce, courses, CRM and automations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
