"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (localStorage.getItem("dukabora_token")) router.replace("/dashboard"); }, [router]);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(""); setLoading(true); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: identifier, password }) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data?.message || "Login failed. Please check your credentials."); const token = data?.token || data?.accessToken || data?.jwt; if (!token) throw new Error("Authentication token not returned by the server."); localStorage.setItem("dukabora_token", token); router.push("/dashboard"); } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to log in right now."); } finally { setLoading(false); } };
  const inputClass = "w-full border border-slate bg-cream px-4 py-3 text-navy outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/20";
  return <main className="flex min-h-screen items-center justify-center bg-navy px-4 py-10"><div className="rise-in w-full max-w-md border border-slate bg-cream p-7 text-navy shadow-2xl sm:p-10"><p className="text-sm font-black uppercase tracking-[0.28em] text-coral">Duka Bora</p><h1 className="mt-8 text-3xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-slate">Sign in to keep your store moving.</p><form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block text-sm font-semibold">Username or email<input id="identifier" type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className={`mt-2 ${inputClass}`} required /></label><label className="block text-sm font-semibold">Password<input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={`mt-2 ${inputClass}`} required /></label>{error ? <div role="alert" className="border border-coral bg-coral/15 px-4 py-3 text-sm text-navy">{error}</div> : null}<button type="submit" disabled={loading} className="w-full bg-coral px-4 py-3 text-sm font-bold text-cream transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button><p className="text-center text-sm text-slate">New to Duka Bora? <Link href="/register" className="font-bold text-coral hover:underline">Create an account</Link></p></form></div></main>;
}
