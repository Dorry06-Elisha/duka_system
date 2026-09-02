"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
};

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "TZS",
  maximumFractionDigits: 0,
});

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "",
    selling_price: "",
    cost_price: "",
    stock_quantity: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("dukabora_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load products.");
        }

        setProducts(data?.products || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
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
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          selling_price: Number(form.selling_price),
          cost_price: Number(form.cost_price),
          stock_quantity: Number(form.stock_quantity),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to add product.");
      }

      setForm({ name: "", selling_price: "", cost_price: "", stock_quantity: "" });
      const refreshResponse = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshData = await refreshResponse.json().catch(() => ({}));
      if (!refreshResponse.ok) {
        throw new Error(refreshData?.message || "Unable to refresh products.");
      }
      setProducts(refreshData?.products || []);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Inventory</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Products</h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Inventory table</h2>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Selling</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {!loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                      <td className="px-4 py-3 text-slate-700">{money.format(product.selling_price)}</td>
                      <td className="px-4 py-3 text-slate-700">{money.format(product.cost_price)}</td>
                      <td className="px-4 py-3 text-slate-700">{product.stock_quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-900">Add Product</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-slate-700">
                Product name
              </label>
              <input
                id="product-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="e.g. Rice 5kg"
                required
              />
            </div>

            <div>
              <label htmlFor="selling-price" className="mb-1 block text-sm font-medium text-slate-700">
                Selling price
              </label>
              <input
                id="selling-price"
                type="number"
                min="0"
                step="0.01"
                value={form.selling_price}
                onChange={(event) => setForm((current) => ({ ...current, selling_price: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <label htmlFor="cost-price" className="mb-1 block text-sm font-medium text-slate-700">
                Cost price
              </label>
              <input
                id="cost-price"
                type="number"
                min="0"
                step="0.01"
                value={form.cost_price}
                onChange={(event) => setForm((current) => ({ ...current, cost_price: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <label htmlFor="stock-quantity" className="mb-1 block text-sm font-medium text-slate-700">
                Stock quantity
              </label>
              <input
                id="stock-quantity"
                type="number"
                min="0"
                step="1"
                value={form.stock_quantity}
                onChange={(event) => setForm((current) => ({ ...current, stock_quantity: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? "Adding product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
