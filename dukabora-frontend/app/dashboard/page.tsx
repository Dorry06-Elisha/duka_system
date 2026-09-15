"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardData = {
  metrics: { totalSales: number; totalRevenue: number; stockCount: number };
  salesTrend: { date?: string; created_at?: string; total_amount: number }[];
  lowStock: { id: number; name: string; stock_quantity: number }[];
};

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getDayIndex = (dateString: string) => {
  const date = new Date(dateString);
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

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
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => { const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result?.message || "Unable to load dashboard."); setData(result); })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, [router]);

  const metrics = data?.metrics || { totalSales: 0, totalRevenue: 0, stockCount: 0 };
  const cards = [["Sales this period", `${metrics.totalSales}`, "Transactions"], ["Revenue captured", currency.format(metrics.totalRevenue), "TZS total"], ["Units in stock", `${metrics.stockCount}`, "Across your catalog"]];
  const trendTotals = Object.fromEntries(daysOrder.map((day) => [day, 0]));
  data?.salesTrend.forEach((sale) => {
    const rawDate = sale.created_at || sale.date;
    if (!rawDate) return;
    const dateString = rawDate.includes("T") ? rawDate : `${rawDate}T00:00:00`;
    if (Number.isNaN(new Date(dateString).getTime())) return;
    const dayIndex = getDayIndex(dateString);
    const day = daysOrder[dayIndex];
    trendTotals[day] += Number(sale.total_amount || 0);
  });
  const trend = daysOrder.map((day) => ({ date: day, total_amount: trendTotals[day] }));

  const welcome = username ? `Welcome back, ${username}! Good business starts with a clear view.` : "Welcome back! Good business starts with a clear view.";
  return <div className="rise-in space-y-7"><div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-coral">Overview</p><h1 className="mt-2 text-3xl font-bold text-cream">{welcome}</h1><p className="mt-2 max-w-2xl text-sm text-cream/70">Watch your sales rhythm and keep the shelves moving.</p></div>{error ? <div role="alert" className="border border-coral bg-coral/15 px-4 py-3 text-sm text-cream">{error}</div> : null}<div className="grid gap-4 md:grid-cols-3">{cards.map(([label, value, hint]) => <div key={label} className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10"><p className="text-sm font-semibold text-slate">{label}</p><p className="mt-4 text-3xl font-bold">{loading ? "--" : value}</p><p className="mt-1 text-xs text-slate">{hint}</p></div>)}</div><div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><section className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">Monday to Sunday</p><h2 className="mt-1 text-xl font-bold">Sales trend</h2></div><span className="bg-coral px-3 py-1 text-xs font-bold text-cream">TZS</span></div><div className="mt-6 h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="#6E7575" strokeDasharray="3 3" opacity={0.35} /><XAxis dataKey="date" tick={{ fill: "#6E7575", fontSize: 12 }} axisLine={{ stroke: "#6E7575" }} tickLine={false} /><YAxis domain={[0, "dataMax + 10000"]} tickFormatter={(value) => `TZS ${Number(value).toLocaleString()}`} tick={{ fill: "#6E7575", fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => `TZS ${Number(value).toLocaleString()}`} contentStyle={{ background: "#172A39", border: "1px solid #6E7575", color: "#E9E4E0" }} /><Line type="monotone" dataKey="total_amount" stroke="#FC563C" strokeWidth={3} dot={{ fill: "#FC563C", r: 4, strokeWidth: 0 }} activeDot={{ fill: "#FC563C", r: 6 }} /></LineChart></ResponsiveContainer></div></section><section className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">Inventory watch</p><h2 className="mt-1 text-xl font-bold">Lowest stock</h2></div><span className="text-2xl text-coral">!</span></div><div className="mt-5 divide-y divide-slate/30">{loading ? <p className="py-4 text-sm text-slate">Loading inventory...</p> : data?.lowStock.length ? data.lowStock.map((product) => <div key={product.id} className="flex items-center justify-between py-3"><span className="truncate pr-3 text-sm font-semibold">{product.name}</span><span className={product.stock_quantity <= 5 ? "bg-coral px-2 py-1 text-xs font-bold text-cream" : "bg-slate/15 px-2 py-1 text-xs font-bold text-slate"}>{product.stock_quantity} units</span></div>) : <p className="py-4 text-sm text-slate">No products to display.</p>}</div></section></div></div>;
}
