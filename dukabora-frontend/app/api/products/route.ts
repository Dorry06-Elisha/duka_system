import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

type ProductRow = RowDataPacket & {
  id: number;
  name: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
};

export async function GET(request: Request) {
  try {
    const authUser = requireAuth(request);

    const [rows] = await pool.execute<ProductRow[]>(
      "SELECT id, name, selling_price, cost_price, stock_quantity FROM products WHERE seller_id = ? ORDER BY name ASC",
      [authUser.userId],
    );

    return NextResponse.json({
      products: rows.map((product) => ({
        id: product.id,
        name: product.name,
        selling_price: Number(product.selling_price),
        cost_price: Number(product.cost_price),
        stock_quantity: Number(product.stock_quantity),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      selling_price?: number | string;
      cost_price?: number | string;
      stock_quantity?: number | string;
    };

    const name = body.name?.trim();
    const sellingPrice = Number(body.selling_price ?? 0);
    const costPrice = Number(body.cost_price ?? 0);
    const stockQuantity = Number(body.stock_quantity ?? 0);

    if (!name || !Number.isFinite(sellingPrice) || !Number.isFinite(costPrice) || !Number.isFinite(stockQuantity)) {
      return NextResponse.json({ message: "Product name, prices, and stock quantity are required." }, { status: 400 });
    }

    const [result] = await pool.execute(
      "INSERT INTO products (name, selling_price, cost_price, stock_quantity, seller_id) VALUES (?, ?, ?, ?, ?)",
      [name, sellingPrice, costPrice, stockQuantity, authUser.userId],
    );

    const insertId = typeof result === "object" && result && "insertId" in result ? Number(result.insertId) : 0;

    return NextResponse.json({
      product: {
        id: insertId,
        name,
        selling_price: sellingPrice,
        cost_price: costPrice,
        stock_quantity: stockQuantity,
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product.";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
