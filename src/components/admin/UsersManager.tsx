"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserRow {
  id: string; email: string; username: string; full_name: string; school_name: string;
  role: "admin" | "teacher"; is_active: boolean; created_at: string; last_login_at: string | null;
  subscription_status: "trial" | "active" | "expired"; trial_generations_used: number; subscription_expires_at: string | null;
}

const emptyForm = { fullName: "", username: "", email: "", schoolName: "", role: "teacher", password: "" };

export function UsersManager() {
  const [users, setUsers] = useState<UserRow[]>([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState(emptyForm); const [message, setMessage] = useState("");
  const load = async () => { setLoading(true); try { const r = await fetch("/api/admin/users"); const d = await r.json(); if (!r.ok) throw new Error(d.message); setUsers(d.users); } catch (e) { setMessage(e instanceof Error ? e.message : "Қате"); } finally { setLoading(false); } };
  useEffect(() => {
    fetch("/api/admin/users").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers(data.users);
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Қате"))
      .finally(() => setLoading(false));
  }, []);
  const mutate = async (url: string, init: RequestInit) => { const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } }); const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; };
  return <div className="grid gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-blue-700">Әкімшілік</p><h1 className="text-3xl font-bold">Қолданушылар</h1><p className="text-sm text-slate-500">Барлығы: {users.length} · Белсенді: {users.filter((u) => u.is_active).length}</p></div><Button onClick={() => setShowForm(!showForm)}>Жаңа қолданушы</Button></div>
    {message && <p role="status" className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
    {showForm && <Card><form className="grid gap-3 md:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault(); setMessage("");
      try { await mutate("/api/admin/users", { method: "POST", body: JSON.stringify(form) }); setForm(emptyForm); setShowForm(false); setMessage("Қолданушы ашылды"); await load(); }
      catch (reason) { setMessage(reason instanceof Error ? reason.message : "Қате"); }
    }}>
      {([["fullName", "Толық аты-жөні"], ["username", "Логин"], ["email", "Email"], ["schoolName", "Мектеп атауы"], ["password", "Уақытша пароль"]] as const).map(([key, label]) => <label key={key} className="grid gap-1 text-sm">{label}<input type={key === "password" ? "password" : key === "email" ? "email" : "text"} required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-11 rounded-xl border px-3" /></label>)}
      <label className="grid gap-1 text-sm">Рөл<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-11 rounded-xl border px-3"><option value="teacher">Мұғалім</option><option value="admin">Әкімші</option></select></label>
      <p className="text-xs text-slate-500 md:col-span-2">Пароль кемінде 10 таңба: бас әріп, кіші әріп және сан.</p><Button className="md:col-span-2">Қолданушыны ашу</Button>
    </form></Card>}
    {loading ? <p>Жүктелуде...</p> : <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-slate-50"><tr>{["Аты-жөні", "Логин", "Email", "Мектебі", "Рөлі", "Күйі", "AI қолжетімділігі", "Тіркелген", "Соңғы кіру", "Әрекет"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t">
      <td className="p-3 font-medium">{user.full_name}</td><td className="p-3">{user.username}</td><td className="p-3">{user.email}</td><td className="p-3">{user.school_name}</td>
      <td className="p-3"><select value={user.role} onChange={async (e) => { try { await mutate(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ role: e.target.value }) }); await load(); } catch (x) { setMessage(x instanceof Error ? x.message : "Қате"); } }} className="rounded-lg border p-1"><option value="teacher">Мұғалім</option><option value="admin">Әкімші</option></select></td>
      <td className="p-3">{user.is_active ? "Белсенді" : "Бұғатталған"}</td><td className="p-3">{user.role === "admin" ? "Шектеусіз" : user.subscription_status === "active" ? `Жазылым (${user.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString("kk-KZ") : "—"})` : `Пробный: ${Math.max(0, 2 - user.trial_generations_used)}/2`}</td><td className="p-3">{new Date(user.created_at).toLocaleDateString("kk-KZ")}</td><td className="p-3">{user.last_login_at ? new Date(user.last_login_at).toLocaleString("kk-KZ") : "—"}</td>
      <td className="p-3"><div className="flex flex-wrap gap-1">
        <Button size="sm" variant="outline" onClick={async () => {
          const fullName = prompt("Толық аты-жөні", user.full_name); if (fullName === null) return;
          const username = prompt("Логин", user.username); if (username === null) return;
          const schoolName = prompt("Мектеп атауы", user.school_name); if (schoolName === null) return;
          try { await mutate(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ fullName, username, schoolName }) }); await load(); }
          catch (x) { setMessage(x instanceof Error ? x.message : "Қате"); }
        }}>Өзгерту</Button>
        <Button size="sm" variant="outline" onClick={async () => { await mutate(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !user.is_active }) }); await load(); }}>{user.is_active ? "Бұғаттау" : "Белсендіру"}</Button>
        <Button size="sm" variant="outline" onClick={async () => { const d = await mutate(`/api/admin/users/${user.id}/reset-password`, { method: "POST" }); setMessage(d.message); }}>Парольді қалпына келтіру</Button>
        {user.role === "teacher" && <Button size="sm" onClick={async () => { await mutate(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ subscriptionAction: "activate" }) }); setMessage("Жазылым 30 күнге қосылды"); await load(); }}>Жазылымды қосу</Button>}
        {user.role === "teacher" && <Button size="sm" variant="outline" onClick={async () => { await mutate(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ subscriptionAction: "reset_trial" }) }); setMessage("2 тегін мүмкіндік қайта берілді"); await load(); }}>Пробныйды жаңарту</Button>}
        <Button size="sm" variant="danger" onClick={async () => { if (!confirm(`${user.full_name} аккаунтын біржола жою керек пе?`)) return; await mutate(`/api/admin/users/${user.id}`, { method: "DELETE" }); await load(); }}>Жою</Button>
      </div></td>
    </tr>)}</tbody></table></div>}
  </div>;
}
