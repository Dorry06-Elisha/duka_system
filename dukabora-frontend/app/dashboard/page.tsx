"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardMetrics = {
  totalSales: number;
  totalRevenue: number;
  stockCount: number;
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "TZS",
  localeMatcher: "best fit",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSales: 0,
    totalRevenue: 0,
    stockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("dukabora_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const loadMetrics = async () => {
      try {
        const response = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load dashboard metrics.");
        }

        setMetrics(data?.metrics || { totalSales: 0, totalRevenue: 0, stockCount: 0 });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [router]);

  const cards = [
    { label: "Total Sales", value: `${metrics.totalSales}`, accent: "emerald" },
    { label: "Total Revenue", value: currency.format(metrics.totalRevenue), accent: "sky" },
    { label: "Stock Count", value: `${metrics.stockCount}`, accent: "amber" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Business dashboard</h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "--" : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
        <p className="mt-2 text-sm text-slate-600">
          Monitor your sales velocity, revenue performance, and current inventory availability in one place.
        </p>
      </div>
    </div>
  );
}
