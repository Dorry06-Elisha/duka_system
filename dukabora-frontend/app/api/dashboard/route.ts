import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

type DashboardSummaryRow = RowDataPacket & {
  totalSales: number;
  totalRevenue: number | string;
  stockCount: number;
};

type SalesTrendRow = RowDataPacket & {
  sale_date: string;
  total_amount: number | string;
};

type LowStockRow = RowDataPacket & {
  id: number;
  name: string;
  stock_quantity: number;
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

    const [trendRows] = await pool.execute<SalesTrendRow[]>(
      `SELECT DATE_FORMAT(sale_date, '%Y-%m-%d') AS sale_date, COALESCE(SUM(total), 0) AS total_amount
       FROM sales
       WHERE sold_by = ? AND sale_date >= CURDATE() - INTERVAL 6 DAY
       GROUP BY DATE(sale_date)
       ORDER BY sale_date ASC`,
      [authUser.userId],
    );

    const today = new Date();
    const trendDates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index));
      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
      return { dateKey, day };
    });
    const totalsByDate = new Map(
      trendRows.map((row) => [String(row.sale_date).slice(0, 10), Number(row.total_amount || 0)]),
    );
    const trendData = trendDates.map(({ dateKey, day }) => ({
      day,
      total: Number(totalsByDate.get(dateKey) || 0),
    }));

    const [lowStockRows] = await pool.execute<LowStockRow[]>(
      `SELECT id, name, stock_quantity
       FROM products
       WHERE seller_id = ? AND stock_quantity <= 10
       ORDER BY stock_quantity ASC, name ASC
       LIMIT 5`,
      [authUser.userId],
    );

    return NextResponse.json({
      metrics: {
        totalSales: Number(metrics.totalSales || 0),
        totalRevenue: Number(metrics.totalRevenue || 0),
        stockCount: Number(metrics.stockCount || 0),
      },
      trendData,
      lowStock: lowStockRows.map((product) => ({
        id: product.id,
        name: product.name,
        stock_quantity: Number(product.stock_quantity || 0),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
