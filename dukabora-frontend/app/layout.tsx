import type { Metadata } from "next";
import AppShell from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dukabora | Inventory & Sales",
  description: "Dukabora dashboard for inventory, sales, and reporting.",
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
