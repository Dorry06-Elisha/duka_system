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
    <div className="space-y-6 text-cream">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold text-cream">Reports</h1>
      </div>
      {error ? <div role="alert" className="border border-coral bg-coral/15 px-4 py-3 text-sm text-cream">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10">
            <p className="text-sm text-slate">{label}</p>
            <p className="mt-3 text-2xl font-bold text-navy">
              {value === undefined ? "--" : label === "Transactions" ? value : money.format(value)}
            </p>
          </div>
        ))}
      </div>
      <div className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10">
        <h2 className="text-xl font-semibold">Daily revenue</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate text-slate"><tr><th className="px-3 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Revenue</th><th className="px-3 py-3 font-medium">Profit</th></tr></thead>
            <tbody>{report?.daily.map((day) => <tr key={day.date} className="border-b border-slate/30"><td className="px-3 py-3 text-navy">{day.date}</td><td className="px-3 py-3 text-navy">{money.format(day.revenue)}</td><td className="px-3 py-3 text-navy">{money.format(day.profit)}</td></tr>)}</tbody>
          </table>
          {report && report.daily.length === 0 ? <p className="py-6 text-center text-sm text-slate">No sales recorded yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
