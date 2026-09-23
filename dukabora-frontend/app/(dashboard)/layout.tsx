"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/sales", label: "Sales" },
  { href: "/reports", label: "Reports" },
  { href: "/profile", label: "Profile" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dukabora_token")) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("dukabora_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="no-print flex items-center justify-between border-b border-slate bg-[#172A39] px-4 py-4 md:hidden">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coral">Smart Duka</p>
        <button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-lg border border-slate p-2 text-cream transition hover:bg-slate/20"
        >
          <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      <div className="flex min-h-screen">
        <aside className={`${isOpen ? "block" : "hidden"} no-print w-72 border-r border-slate bg-[#172A39] text-cream md:flex md:flex-col`}>
          <div className="border-b border-slate px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
              Smart Duka
            </p>
            <h1 className="mt-2 text-2xl font-bold">Business Hub</h1>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={[
                    "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-coral text-cream shadow-lg shadow-coral/20"
                      : "text-cream/70 hover:bg-slate/20 hover:text-cream",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center rounded-xl border border-slate bg-transparent px-4 py-3 text-sm font-medium text-cream transition hover:bg-coral hover:text-cream"
            >
              Logout
            </button>
          </nav>
        </aside>

        <div className="flex-1">
          <header className="no-print hidden border-b border-slate bg-navy backdrop-blur-sm md:block">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate">
                  Inventory & sales
                </p>
                <h2 className="mt-1 text-xl font-semibold text-cream">
                  {navItems.find((item) => item.href === pathname)?.label ?? "Overview"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center rounded-full border border-slate bg-transparent px-4 py-2 text-sm font-medium text-cream transition hover:bg-coral hover:text-cream"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
