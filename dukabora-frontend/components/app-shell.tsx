"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/sales", label: "Sales" },
  { href: "/reports", label: "Reports" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthScreen = pathname === "/login";

  const handleLogout = () => {
    localStorage.removeItem("dukabora_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {!isAuthScreen ? (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-slate-900">
              Dukabora
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              Logout
            </button>
          </div>
        </header>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
