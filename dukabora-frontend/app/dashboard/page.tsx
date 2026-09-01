export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Sales", value: "0", tone: "emerald" },
          { label: "Total Revenue", value: "KSh 0", tone: "sky" },
          { label: "Low Stock Alerts", value: "0", tone: "amber" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
        <p className="mt-2 text-sm text-slate-600">
          The dashboard is ready for your live sales and inventory metrics.
        </p>
      </div>
    </div>
  );
}
