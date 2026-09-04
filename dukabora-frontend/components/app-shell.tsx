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
  const isAuthScreen = pathname === "/login" || pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("dukabora_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-navy text-cream">
      {!isAuthScreen ? (
        <header className="border-b border-slate bg-navy/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-cream">
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
                        ? "bg-coral text-cream shadow-lg shadow-coral/20"
                        : "text-cream/70 hover:bg-slate/20 hover:text-cream",
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
              className="rounded-full border border-slate bg-transparent px-4 py-2 text-sm font-medium text-cream transition hover:bg-coral hover:text-cream"
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
