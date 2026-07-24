"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  return <form className="grid gap-4" onSubmit={async (e) => {
    e.preventDefault(); setLoading(true);
    try { const r = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const d = await r.json(); setMessage(d.message); }
    finally { setLoading(false); }
  }}>
    <label className="grid gap-2 text-sm font-medium">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border px-3" /></label>
    {message && <p role="status" className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
    <Button disabled={loading}>{loading ? "Жіберілуде..." : "Сілтемені жіберу"}</Button>
    <Link href="/login" className="text-center text-sm text-blue-700">Кіру бетіне оралу</Link>
  </form>;
}

export function ResetPasswordForm() {
  const router = useRouter(); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  return <form className="grid gap-4" onSubmit={async (e) => {
    e.preventDefault(); if (password !== confirm) return setMessage("Парольдер сәйкес келмейді");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.message); setMessage("Пароль сәтті өзгертілді"); setTimeout(() => router.replace("/dashboard"), 800);
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Қате шықты"); } finally { setLoading(false); }
  }}>
    <label className="grid gap-2 text-sm font-medium">Жаңа пароль<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border px-3" /></label>
    <label className="grid gap-2 text-sm font-medium">Парольді қайталаңыз<input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 rounded-xl border px-3" /></label>
    <p className="text-xs text-slate-500">Кемінде 10 таңба, бас және кіші әріп, сан болуы керек.</p>
    {message && <p role="status" className="rounded-xl bg-blue-50 p-3 text-sm">{message}</p>}
    <Button disabled={loading}>{loading ? "Сақталуда..." : "Жаңа парольді сақтау"}</Button>
  </form>;
}
