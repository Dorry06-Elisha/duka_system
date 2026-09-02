import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";

type ReportSummaryRow = RowDataPacket & {
  revenue: number | string;
  cost: number | string;
  profit: number | string;
  transactions: number;
};

type DailyRevenueRow = RowDataPacket & {
  report_date: string;
  revenue: number | string;
  profit: number | string;
};

export async function GET(request: Request) {
  try {
    const authUser = requireAuth(request);
    const [summaryRows] = await db.execute<ReportSummaryRow[]>(
      `SELECT
        COALESCE(SUM(s.total), 0) AS revenue,
        COALESCE(SUM(s.quantity * p.cost_price), 0) AS cost,
        COALESCE(SUM(s.quantity * (s.sale_price - p.cost_price)), 0) AS profit,
        COUNT(s.id) AS transactions
       FROM sales s
       INNER JOIN products p ON p.id = s.product_id
       WHERE s.sold_by = ?`,
      [authUser.userId],
    );
    const [dailyRows] = await db.execute<DailyRevenueRow[]>(
      `SELECT DATE(s.sale_date) AS report_date,
        COALESCE(SUM(s.total), 0) AS revenue,
        COALESCE(SUM(s.quantity * (s.sale_price - p.cost_price)), 0) AS profit
       FROM sales s
       INNER JOIN products p ON p.id = s.product_id
       WHERE s.sold_by = ?
       GROUP BY DATE(s.sale_date)
       ORDER BY report_date DESC
       LIMIT 30`,
      [authUser.userId],
    );

    const summary = summaryRows[0] || { revenue: 0, cost: 0, profit: 0, transactions: 0 };
    return NextResponse.json({
      summary: {
        revenue: Number(summary.revenue),
        cost: Number(summary.cost),
        profit: Number(summary.profit),
        transactions: Number(summary.transactions),
      },
      daily: dailyRows.map((day) => ({
        date: day.report_date,
        revenue: Number(day.revenue),
        profit: Number(day.profit),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load reports.";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}