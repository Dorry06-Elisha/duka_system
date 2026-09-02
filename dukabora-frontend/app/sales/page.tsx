"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  selling_price: number;
  stock_quantity: number;
};

type Sale = {
  id: number;
  product_name: string;
  quantity: number;
  sale_price: number;
  total: number;
  sale_date: string;
};

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default function SalesPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const token = localStorage.getItem("dukabora_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const [productsResponse, salesResponse] = await Promise.all([
        fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/sales", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const productsData = await productsResponse.json().catch(() => ({}));
      const salesData = await salesResponse.json().catch(() => ({}));

      if (!productsResponse.ok) {
        throw new Error(productsData?.message || "Unable to load products.");
      }

      if (!salesResponse.ok) {
        throw new Error(salesData?.message || "Unable to load sales.");
      }

      setProducts(productsData?.products || []);
      setSales(salesData?.sales || []);
      if (productsData?.products?.length) {
        setProductId(String(productsData.products[0].id));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const token = localStorage.getItem("dukabora_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: Number(productId),
          quantity: Number(quantity),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to process sale.");
      }

      setQuantity("1");
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to process sale.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((product) => String(product.id) === productId);
  const totalValue = selectedProduct ? selectedProduct.selling_price * Number(quantity || 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Transactions</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Sales</h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-900">Process new sale</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="product-select" className="mb-1 block text-sm font-medium text-slate-700">
                Product
              </label>
              <select
                id="product-select"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                disabled={products.length === 0}
                required
              >
                {products.length === 0 ? (
                  <option value="">No products available</option>
                ) : (
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.stock_quantity} in stock)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-700">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Unit price</span>
                <span className="font-medium text-slate-900">
                  {selectedProduct ? money.format(selectedProduct.selling_price) : "-"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Total</span>
                <span className="font-medium text-emerald-700">{money.format(totalValue)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || products.length === 0}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? "Processing sale..." : "Process Sale"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent sales</h2>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {!loading && sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{sale.product_name}</td>
                      <td className="px-4 py-3 text-slate-700">{sale.quantity}</td>
                      <td className="px-4 py-3 text-slate-700">{money.format(sale.total)}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(sale.sale_date).toLocaleDateString("en-KE")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
