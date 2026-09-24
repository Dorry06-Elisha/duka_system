"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardData = {
  metrics: { totalSales: number; totalRevenue: number; stockCount: number };
  lowStock: { id: number; name: string; stock_quantity: number }[];
  sales: Sale[];
};

type DashboardApiResponse = Omit<DashboardData, "sales">;

type SalesApiResponse = {
  sales?: Sale[];
};

type Sale = {
  id: number;
  product_name: string;
  quantity: number;
  total: number;
  sale_date: string;
};

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username] = useState(() => {
    if (typeof window === "undefined") return "";
    const token = localStorage.getItem("dukabora_token");
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.name || payload.username || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("dukabora_token");
    if (!token) { router.replace("/login"); return; }
    Promise.all([
      fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/sales", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([dashboardResponse, salesResponse]) => {
        const dashboardResult = await dashboardResponse.json().catch(() => ({})) as DashboardApiResponse & { message?: string };
        const salesResult = await salesResponse.json().catch(() => ({})) as SalesApiResponse & { message?: string };
        if (!dashboardResponse.ok) throw new Error(dashboardResult.message || "Unable to load dashboard.");
        if (!salesResponse.ok) throw new Error(salesResult.message || "Unable to load sales.");
        setData({ ...dashboardResult, sales: salesResult.sales || [] });
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, [router]);

  const metrics = data?.metrics || { totalSales: 0, totalRevenue: 0, stockCount: 0 };
  const cards = [["Sales this period", `${metrics.totalSales}`, "Transactions"], ["Revenue captured", currency.format(metrics.totalRevenue), "TZS total"], ["Units in stock", `${metrics.stockCount}`, "Across your catalog"]];
  const topProducts = Array.from(
    (data?.sales || []).reduce((productTotals, sale) => {
      const current = productTotals.get(sale.product_name) || 0;
      productTotals.set(sale.product_name, current + Number(sale.quantity || 0));
      return productTotals;
    }, new Map<string, number>()),
  )
    .map(([name, units]) => ({ name, units }))
    .sort((first, second) => second.units - first.units)
    .slice(0, 5);

  const welcome = username ? `Welcome back, ${username}! Good business starts with a clear view.` : "Welcome back! Good business starts with a clear view.";
  return <div className="rise-in space-y-7"><div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-coral">Overview</p><h1 className="mt-2 text-3xl font-bold text-cream">{welcome}</h1><p className="mt-2 max-w-2xl text-sm text-cream/70">Watch your sales rhythm and keep the shelves moving.</p></div>{error ? <div role="alert" className="border border-coral bg-coral/15 px-4 py-3 text-sm text-cream">{error}</div> : null}<div className="grid gap-4 md:grid-cols-3">{cards.map(([label, value, hint]) => <div key={label} className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10"><p className="text-sm font-semibold text-slate">{label}</p><p className="mt-4 text-3xl font-bold">{loading ? "--" : value}</p><p className="mt-1 text-xs text-slate">{hint}</p></div>)}</div><div className="grid items-stretch gap-6 lg:grid-cols-2"><section className="print:hidden border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">Best sellers</p><h2 className="mt-1 text-xl font-bold">Top Selling Products</h2></div><span className="bg-coral px-3 py-1 text-xs font-bold text-cream">TOP 5</span></div><div className="mt-5 divide-y divide-slate/30">{loading ? <p className="py-4 text-sm text-slate">Loading products...</p> : topProducts.length ? topProducts.map((product, index) => <div key={product.name} className="flex items-center gap-3 py-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center bg-navy text-xs font-bold text-cream">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{product.name}</span><span className="bg-slate/15 px-2 py-1 text-xs font-bold text-slate">{product.units} units</span></div>) : <p className="py-4 text-sm text-slate">No sales recorded yet.</p>}</div></section><section className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">Inventory watch</p><h2 className="mt-1 text-xl font-bold">Lowest stock</h2></div><span className="text-2xl text-coral">!</span></div><div className="mt-5 divide-y divide-slate/30">{loading ? <p className="py-4 text-sm text-slate">Loading inventory...</p> : data?.lowStock.length ? data.lowStock.map((product) => <div key={product.id} className="flex items-center justify-between py-3"><span className="truncate pr-3 text-sm font-semibold">{product.name}</span><span className={product.stock_quantity <= 5 ? "bg-coral px-2 py-1 text-xs font-bold text-cream" : "bg-slate/15 px-2 py-1 text-xs font-bold text-slate"}>{product.stock_quantity} units</span></div>) : <p className="py-4 text-sm text-slate">No products to display.</p>}</div></section></div></div>;
}
