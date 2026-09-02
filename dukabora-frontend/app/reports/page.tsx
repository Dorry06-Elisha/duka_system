"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ReportData = {
  summary: { revenue: number; cost: number; profit: number; transactions: number };
  daily: { date: string; revenue: number; profit: number }[];
};

const money = new Intl.NumberFormat("en-TZ", {
  style: "currency",
  currency: "TZS",
  maximumFractionDigits: 0,
});

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("dukabora_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/reports", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || "Unable to load reports.");
        setReport(data);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load reports."));
  }, [router]);

  const summary = report?.summary;
  const cards = [
    ["Revenue", summary?.revenue],
    ["Cost", summary?.cost],
    ["Profit", summary?.profit],
    ["Transactions", summary?.transactions],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Reports</h1>
      </div>
      {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {value === undefined ? "--" : label === "Transactions" ? value : money.format(value)}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Daily revenue</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Revenue</th><th className="px-3 py-3 font-medium">Profit</th></tr></thead>
            <tbody>{report?.daily.map((day) => <tr key={day.date} className="border-b border-slate-100"><td className="px-3 py-3 text-slate-700">{day.date}</td><td className="px-3 py-3 text-slate-700">{money.format(day.revenue)}</td><td className="px-3 py-3 text-slate-700">{money.format(day.profit)}</td></tr>)}</tbody>
          </table>
          {report && report.daily.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No sales recorded yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
