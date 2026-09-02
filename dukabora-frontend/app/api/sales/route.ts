import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

type SaleRow = RowDataPacket & {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  sale_price: number;
  total: number;
  sold_by: number;
  sale_date: string;
};

type ProductStockRow = RowDataPacket & {
  id: number;
  name: string;
  selling_price: number;
  stock_quantity: number;
};

export async function GET(request: Request) {
  try {
    const authUser = requireAuth(request);

    const [rows] = await pool.execute<SaleRow[]>(
      `SELECT s.id, s.product_id, p.name AS product_name, s.quantity, s.sale_price, s.total, s.sold_by, s.sale_date
       FROM sales s
       LEFT JOIN products p ON p.id = s.product_id
       WHERE s.sold_by = ?
       ORDER BY s.sale_date DESC`,
      [authUser.userId],
    );

    return NextResponse.json({
      sales: rows.map((sale) => ({
        id: sale.id,
        product_id: sale.product_id,
        product_name: sale.product_name,
        quantity: Number(sale.quantity),
        sale_price: Number(sale.sale_price),
        total: Number(sale.total),
        sold_by: sale.sold_by,
        sale_date: sale.sale_date,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const authUser = requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      product_id?: number | string;
      quantity?: number | string;
    };

    const productId = Number(body.product_id ?? 0);
    const quantity = Number(body.quantity ?? 0);

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ message: "A valid product and quantity are required." }, { status: 400 });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [productRows] = await connection.execute<ProductStockRow[]>(
      "SELECT id, name, selling_price, stock_quantity FROM products WHERE id = ? AND seller_id = ? LIMIT 1 FOR UPDATE",
      [productId, authUser.userId],
    );

    const product = productRows[0];
    if (!product) {
      await connection.rollback();
      transactionStarted = false;
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    if (product.stock_quantity < quantity) {
      await connection.rollback();
      transactionStarted = false;
      return NextResponse.json({ message: "Not enough stock available for this sale." }, { status: 400 });
    }

    const salePrice = Number(product.selling_price);
    const total = salePrice * quantity;

    const [saleResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO sales (product_id, quantity, sale_price, total, sold_by, sale_date) VALUES (?, ?, ?, ?, ?, NOW())",
      [product.id, quantity, salePrice, total, authUser.userId],
    );

    await connection.execute("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?", [quantity, product.id]);
    await connection.commit();
    transactionStarted = false;

    return NextResponse.json(
      {
        sale: {
          id: Number(saleResult.insertId),
          product_id: product.id,
          product_name: product.name,
          quantity,
          sale_price: salePrice,
          total,
          sold_by: authUser.userId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }
    const message = error instanceof Error ? error.message : "Unable to create sale.";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  } finally {
    connection?.release();
  }
}
