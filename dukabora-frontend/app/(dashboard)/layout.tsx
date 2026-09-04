"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate bg-navy text-cream md:flex">
          <div className="border-b border-slate px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
              Dukabora
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
          <header className="border-b border-slate bg-navy backdrop-blur-sm">
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
