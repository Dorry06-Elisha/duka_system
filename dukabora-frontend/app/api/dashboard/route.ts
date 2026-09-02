import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

type DashboardSummaryRow = RowDataPacket & {
  totalSales: number;
  totalRevenue: number | string;
  stockCount: number;
};

export async function GET(request: Request) {
  try {
    const authUser = requireAuth(request);

    const [summaryRows] = await pool.execute<DashboardSummaryRow[]>(
      `SELECT
        COALESCE((SELECT COUNT(*) FROM sales WHERE sold_by = ?), 0) AS totalSales,
        COALESCE((SELECT SUM(total) FROM sales WHERE sold_by = ?), 0) AS totalRevenue,
        COALESCE((SELECT SUM(stock_quantity) FROM products WHERE seller_id = ?), 0) AS stockCount
      `,
      [authUser.userId, authUser.userId, authUser.userId],
    );

    const metrics = summaryRows[0] || { totalSales: 0, totalRevenue: 0, stockCount: 0 };

    return NextResponse.json({
      metrics: {
        totalSales: Number(metrics.totalSales || 0),
        totalRevenue: Number(metrics.totalRevenue || 0),
        stockCount: Number(metrics.stockCount || 0),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
