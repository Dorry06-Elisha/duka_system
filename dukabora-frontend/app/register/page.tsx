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
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-10">
      <div className="rise-in w-full max-w-md border border-slate bg-cream p-7 text-navy shadow-2xl sm:p-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-coral">Duka Bora</p>
          <h1 className="mt-8 text-3xl font-bold">Open your store desk</h1>
          <p className="mt-2 text-sm text-slate">Create an account to manage inventory and sales.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">Full name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full border border-slate bg-cream px-4 py-3 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20" required />
          </label>
          <label className="block text-sm font-medium text-slate-700">Username
            <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="mt-2 w-full border border-slate bg-cream px-4 py-3 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20" required />
          </label>
          <label className="block text-sm font-medium text-slate-700">Password
            <input type="password" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full border border-slate bg-cream px-4 py-3 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20" required />
          </label>
          {error ? <div role="alert" className="border border-coral bg-coral/15 px-4 py-3 text-sm text-navy">{error}</div> : null}
          <button type="submit" disabled={loading} className="w-full bg-coral px-4 py-3 text-sm font-bold text-cream transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account..." : "Create account"}</button>
          <p className="text-center text-sm text-slate">Already registered? <Link href="/login" className="font-bold text-coral hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}