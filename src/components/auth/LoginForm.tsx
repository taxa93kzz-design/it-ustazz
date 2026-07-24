"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LoginForm({ configured = true }: { configured?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(!configured || params.get("error") === "config" ? "Supabase сервері бапталмаған. Әкімші .env.local файлына қосылу деректерін енгізуі керек." : "");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password, remember }) });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message);
      const next = params.get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Сервермен байланысу мүмкін болмады"); }
    finally { setLoading(false); }
  };
  return <form onSubmit={submit} className="grid gap-4">
    <label className="grid gap-2 text-sm font-medium">Email немесе логин<input autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 rounded-xl border px-3" placeholder="ustaz немесе ustaz@mektep.kz" /></label>
    <label className="grid gap-2 text-sm font-medium">Пароль<span className="relative"><input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-xl border px-3 pr-12" /><button type="button" aria-label={show ? "Парольді жасыру" : "Парольді көрсету"} onClick={() => setShow(!show)} className="absolute right-3 top-3">{show ? <EyeOff /> : <Eye />}</button></span></label>
    <div className="flex items-center justify-between gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Мені есте сақтау</label><Link href="/forgot-password" className="text-blue-700 hover:underline">Парольді ұмыттым</Link></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button className="h-12" disabled={loading || !configured}>{loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}{loading ? "Кіру орындалуда..." : configured ? "Кіру" : "Supabase бапталмаған"}</Button>
  </form>;
}
