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
    <div className="space-y-6 text-cream">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate">Inventory</p>
          <h1 className="mt-2 text-3xl font-bold text-cream">Products</h1>
        </div>
      </div>

      {error ? (
        <div className="border border-coral bg-coral/15 px-4 py-3 text-sm text-cream">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10">
          <h2 className="text-xl font-semibold">Inventory table</h2>

          <div className="mt-4 overflow-hidden border border-slate">
            <table className="min-w-full divide-y divide-slate text-left text-sm">
              <thead className="bg-navy text-cream">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Selling</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate bg-cream">
                {!loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate/10">
                      <td className="px-4 py-3 font-medium text-navy">{product.name}</td>
                      <td className="px-4 py-3 text-navy">{money.format(product.selling_price)}</td>
                      <td className="px-4 py-3 text-navy">{money.format(product.cost_price)}</td>
                      <td className="px-4 py-3 text-navy">{product.stock_quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-slate bg-cream p-5 text-navy shadow-lg shadow-black/10"
        >
          <h2 className="text-xl font-semibold">Add Product</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-slate">
                Product name
              </label>
              <input
                id="product-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full border border-slate bg-cream px-3 py-2.5 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20"
                placeholder="e.g. Rice 5kg"
                required
              />
            </div>

            <div>
              <label htmlFor="selling-price" className="mb-1 block text-sm font-medium text-slate">
                Selling price
              </label>
              <input
                id="selling-price"
                type="number"
                min="0"
                step="0.01"
                value={form.selling_price}
                onChange={(event) => setForm((current) => ({ ...current, selling_price: event.target.value }))}
                className="w-full border border-slate bg-cream px-3 py-2.5 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20"
                required
              />
            </div>

            <div>
              <label htmlFor="cost-price" className="mb-1 block text-sm font-medium text-slate">
                Cost price
              </label>
              <input
                id="cost-price"
                type="number"
                min="0"
                step="0.01"
                value={form.cost_price}
                onChange={(event) => setForm((current) => ({ ...current, cost_price: event.target.value }))}
                className="w-full border border-slate bg-cream px-3 py-2.5 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20"
                required
              />
            </div>

            <div>
              <label htmlFor="stock-quantity" className="mb-1 block text-sm font-medium text-slate">
                Stock quantity
              </label>
              <input
                id="stock-quantity"
                type="number"
                min="0"
                step="1"
                value={form.stock_quantity}
                onChange={(event) => setForm((current) => ({ ...current, stock_quantity: event.target.value }))}
                className="w-full border border-slate bg-cream px-3 py-2.5 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-coral px-4 py-3 text-sm font-semibold text-cream transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Adding product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
