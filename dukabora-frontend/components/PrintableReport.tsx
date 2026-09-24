"use client";

import React, { useRef } from "react";

type PrintableRow = Record<string, unknown>;

interface SaleItem {
  name?: string;
  description?: string;
  quantity: number;
  price: number;
  total?: number;
}

interface PrintableColumn {
  header: string;
  key: string;
  align?: React.CSSProperties["textAlign"];
  render?: (value: unknown, row: PrintableRow) => React.ReactNode;
}

interface PrintableReportProps {
  saleData?: {
    items?: SaleItem[];
    total?: number;
    customer?: string;
    date?: string;
  };
  items?: SaleItem[];
  title?: string;
  total?: number;
  customer?: string;
  date?: string;
  columns?: string[] | PrintableColumn[];
  rows?: PrintableRow[];
  fileName?: string;
  totals?: Array<{ label: string; value: React.ReactNode }>;
}

const isColumnDescriptor = (
  column: string | PrintableColumn,
): column is PrintableColumn => typeof column !== "string";

const formatNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-TZ") : "-";
};

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const parsedDate = new Date(String(value));
  return Number.isNaN(parsedDate.getTime()) ? String(value) : parsedDate.toLocaleDateString();
};

export default function PrintableReport({
  saleData,
  items,
  title = "Sales Receipt",
  total,
  customer,
  date,
  columns = [],
  rows = [],
  fileName,
  totals = [],
}: PrintableReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const generatedFileNameRef = useRef<string | undefined>(undefined);
  const activeItems = items || saleData?.items || [];
  const grandTotal = total ?? saleData?.total ?? 0;
  const customerName = customer || saleData?.customer || "Walk-in customer";
  const reportDate = formatDate(date || saleData?.date || new Date().toISOString());
  const hasTableData = rows.length > 0 || columns.length > 0;
  const normalizedColumns = columns.map((column) =>
    typeof column === "string" ? { header: column, key: column } : column,
  );

  const renderCellValue = (column: PrintableColumn | { header: string; key: string }, row: PrintableRow) => {
    const value = row?.[column.key];
    if (isColumnDescriptor(column) && column.render) return column.render(value, row);
    if (column.key === "date" || column.key === "sale_date") return formatDate(value);
    return String(value ?? "-");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element || typeof window === "undefined" || typeof document === "undefined") return;

    try {
      const pdfFileName = fileName || generatedFileNameRef.current || (generatedFileNameRef.current = `Smart_Duka_Receipt_${Date.now()}`);
      const html2pdf = (await import("html2pdf.js")).default;
      const options = {
        margin: 0.5,
        filename: pdfFileName.endsWith(".pdf") ? pdfFileName : `${pdfFileName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          onclone: (clonedDocument: Document) => {
            clonedDocument.querySelectorAll<HTMLElement>("*").forEach((node) => {
              const computed = window.getComputedStyle(node);
              if (/oklch|oklab/i.test(computed.backgroundColor)) {
                node.style.backgroundColor = "#ffffff";
              }
              if (/oklch|oklab/i.test(computed.color)) {
                node.style.color = "#000000";
              }
              if (/oklch|oklab/i.test(computed.borderColor)) {
                node.style.borderColor = "#d1d5db";
              }
            });
          },
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf(element).set(options).from(element).save();
    } catch (error) {
      console.error("PDF generation error. Falling back to print:", error);
      window.print();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="mb-4 flex justify-end gap-3 print:hidden">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="cursor-pointer rounded bg-orange-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-orange-700"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="cursor-pointer rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow transition-colors hover:bg-gray-100"
        >
          Print Directly
        </button>
      </div>

      <div ref={reportRef} id="receipt-content" style={{ backgroundColor: "#ffffff", color: "#000000", border: "1px solid #d1d5db", padding: "2rem" }}>
        <header style={{ borderBottom: "1px solid #d1d5db", marginBottom: "1.5rem", paddingBottom: "1rem" }}>
          <h1 style={{ color: "#ea580c", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>SMART DUKA</h1>
          <h2 style={{ color: "#1f2937", fontSize: "1.25rem", fontWeight: 600, marginTop: "0.25rem" }}>{title}</h2>
          <p style={{ color: "#4b5563", fontSize: "0.875rem", marginTop: "0.25rem" }}>Date: {reportDate}</p>
          <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Customer: {customerName}</p>
        </header>

        {hasTableData ? (
          <div className="overflow-x-auto">
            <table style={{ borderCollapse: "collapse", color: "#000000", minWidth: "100%", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                <tr>
                  {normalizedColumns.map((column) => (
                    <th key={column.key} style={{ padding: "0.75rem", fontWeight: 600, textAlign: column.align || "left" }}>{column.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={normalizedColumns.length || 1} style={{ color: "#4b5563", padding: "1.5rem", textAlign: "center" }}>No items available for this receipt.</td></tr>
                ) : rows.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    {normalizedColumns.map((column) => (
                      <td key={column.key} style={{ padding: "0.75rem", textAlign: column.align || "left" }}>
                        {renderCellValue(column, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <table style={{ borderCollapse: "collapse", color: "#000000", minWidth: "100%", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
              <tr><th style={{ padding: "0.75rem" }}>Item description</th><th style={{ padding: "0.75rem" }}>Quantity</th><th style={{ padding: "0.75rem" }}>Price (TZS)</th><th style={{ padding: "0.75rem" }}>Total (TZS)</th></tr>
            </thead>
            <tbody>
              {activeItems.length === 0 ? (
                <tr><td colSpan={4} style={{ color: "#4b5563", padding: "1.5rem", textAlign: "center" }}>No items available for this receipt.</td></tr>
              ) : activeItems.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "0.75rem" }}>{item.name || item.description || "-"}</td>
                  <td style={{ padding: "0.75rem" }}>{formatNumber(item.quantity)}</td>
                  <td style={{ padding: "0.75rem" }}>{formatNumber(item.price)}</td>
                  <td style={{ padding: "0.75rem" }}>{formatNumber(item.total ?? item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totals.length > 0 ? (
          <div className="ml-auto mt-5 max-w-xs space-y-2 border-t pt-3">
            {totals.map((entry) => <div key={entry.label} className="flex justify-between gap-4 text-sm"><span>{entry.label}</span><strong>{entry.value}</strong></div>)}
          </div>
        ) : (
          <div style={{ borderTop: "1px solid #d1d5db", display: "flex", fontWeight: 700, justifyContent: "space-between", marginLeft: "auto", marginTop: "1.25rem", maxWidth: "20rem", paddingTop: "0.75rem" }}><span>Total</span><span>{formatNumber(grandTotal)}</span></div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
