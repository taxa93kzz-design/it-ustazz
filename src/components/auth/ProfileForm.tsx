"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CurrentProfile } from "@/lib/auth";

export function ProfileForm({ profile }: { profile: CurrentProfile }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [schoolName, setSchoolName] = useState(profile.school_name);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  return <div className="grid gap-6">
    <form className="grid gap-4 rounded-2xl border bg-white p-5" onSubmit={async (e) => {
      e.preventDefault(); setLoading(true); setMessage("");
      try { const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, schoolName }) }); const d = await r.json(); if (!r.ok) throw new Error(d.message); setMessage("Профиль сақталды"); }
      catch (reason) { setMessage(reason instanceof Error ? reason.message : "Қате шықты"); } finally { setLoading(false); }
    }}>
      <label className="grid gap-2 text-sm font-medium">Аты-жөні<input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl border px-3" /></label>
      <label className="grid gap-2 text-sm font-medium">Мектеп атауы<input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="h-11 rounded-xl border px-3" /></label>
      <label className="grid gap-2 text-sm font-medium">Логин<input disabled value={profile.username} className="h-11 rounded-xl border bg-slate-100 px-3" /></label>
      <label className="grid gap-2 text-sm font-medium">Рөл<input disabled value={profile.role === "admin" ? "Әкімші" : "Мұғалім"} className="h-11 rounded-xl border bg-slate-100 px-3" /></label>
      {message && <p role="status" className="text-sm text-blue-700">{message}</p>}
      <Button disabled={loading}>{loading ? "Сақталуда..." : "Профильді сақтау"}</Button>
    </form>
    <form action="/api/auth/logout" method="post"><Button variant="danger">Жүйеден шығу</Button></form>
  </div>;
}
