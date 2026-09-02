"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Unable to create your account.");
      router.push("/login");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-100 to-slate-200 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
        <div className="bg-slate-900 px-6 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Dukabora</p>
          <h1 className="mt-3 text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-slate-300">Set up a seller account to manage your store.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <label className="block text-sm font-medium text-slate-700">Full name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" required />
          </label>
          <label className="block text-sm font-medium text-slate-700">Username
            <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" required />
          </label>
          <label className="block text-sm font-medium text-slate-700">Password
            <input type="password" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" required />
          </label>
          {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-300">{loading ? "Creating account..." : "Create account"}</button>
          <p className="text-center text-sm text-slate-600">Already registered? <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}