import type { Metadata } from "next";
import AppShell from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Duka - Retail & Inventory System",
  description: "Smart Duka retail management for inventory, sales, receipts, and reporting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-navy text-cream">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
