"use client";

import { useRef } from "react";

export type PrintableColumn<T> = {
  header: string;
  key: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type PrintableTotal = {
  label: string;
  value: React.ReactNode;
};

type PrintableReportProps<T> = {
  title: string;
  columns: PrintableColumn<T>[];
  rows: T[];
  date?: string;
  customerName?: string;
  fileName: string;
  totals?: PrintableTotal[];
};

export default function PrintableReport<T>({
  title,
  columns,
  rows,
  date = new Date().toLocaleDateString("en-TZ"),
  customerName = "Walk-in customer",
  totals = [],
}: PrintableReportProps<T>) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0.5,
        filename: "Sales_Receipt.pdf",
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          onclone: (clonedDoc: Document) => {
            const elements = clonedDoc.querySelectorAll("*");
            elements.forEach((element) => {
              if (!(element instanceof HTMLElement)) return;

              const style = window.getComputedStyle(element);
              if (style.backgroundColor.includes("okl")) {
                element.style.backgroundColor = "#ffffff";
              }
              if (style.color.includes("okl")) {
                element.style.color = "#000000";
              }
            });
          },
        },
        jsPDF: { unit: "in" as const, format: "letter" as const, orientation: "portrait" as const },
      };

      await html2pdf(reportRef.current)
        .set(opt)
        .from(reportRef.current)
        .save();
    } catch (error) {
      console.error("Unable to generate PDF.", error);
    }
  };

  return (
    <section ref={reportRef} className="print-document border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">SMART DUKA</p>
          <h2 className="mt-2 text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-slate">Date: {date}</p>
          <p className="text-sm text-slate">Customer: {customerName}</p>
        </div>
        <div className="no-print print:hidden flex shrink-0 gap-2">
          <button type="button" onClick={handleDownloadPdf} className="bg-coral px-3 py-2 text-sm font-semibold text-cream hover:brightness-95">Download PDF</button>
          <button type="button" onClick={() => window.print()} className="border border-slate px-3 py-2 text-sm font-semibold text-navy hover:bg-slate/10">Print Directly</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate bg-navy text-cream"><tr>{columns.map((column) => <th key={String(column.key)} className="px-3 py-3 font-medium">{column.header}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-slate">No records available.</td></tr> : rows.map((row, index) => <tr key={index} className="border-b border-slate/30">{columns.map((column) => <td key={String(column.key)} className="px-3 py-3">{column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "-")}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {totals.length > 0 ? <div className="mt-5 ml-auto max-w-xs space-y-2 border-t border-slate pt-3">{totals.map((total) => <div key={total.label} className="flex justify-between gap-4 text-sm"><span className="font-medium">{total.label}</span><span className="font-bold">{total.value}</span></div>)}</div> : null}
    </section>
  );
}