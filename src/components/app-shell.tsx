"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  Library,
  Menu,
  PanelLeftClose,
  Sparkles,
  LogOut,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CurrentProfile } from "@/lib/auth";

const links = [
  { href: "/", label: "Басты бет", icon: Home },
  { href: "/kmzh", label: "ҚМЖ генераторы", icon: BookOpenCheck },
  { href: "/tasks", label: "Тапсырмалар", icon: FileText },
  { href: "/tests", label: "Тест генераторы", icon: ClipboardCheck },
  { href: "/worksheet", label: "Жұмыс парағы", icon: GraduationCap },
  { href: "/materials", label: "Менің материалдарым", icon: Library },
];

export function AppShell({ children, profile }: { children: React.ReactNode; profile: CurrentProfile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const publicAuthPage = ["/login", "/forgot-password", "/reset-password"].includes(pathname);
  if (publicAuthPage) return <main className="min-h-screen bg-slate-50 p-4">{children}</main>;

  return (
    <div className="min-h-screen bg-slate-50">
      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          aria-label="Мәзірді жабу"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Sparkles className="size-5" />
            </span>
            <span>
              <strong className="block text-lg text-slate-950">IT Ustaz</strong>
              <span className="text-xs text-slate-500">Цифрлық көмекші</span>
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Жабу">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <item.icon className="size-5" /> {item.label}
              </Link>
            );
          })}
          {profile?.role === "admin" && <Link href="/admin/users" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><ShieldCheck className="size-5" /> Қолданушылар</Link>}
        </nav>
        <div className="m-4 rounded-2xl bg-slate-950 p-4 text-white">
          <PanelLeftClose className="mb-3 size-5 text-blue-300" />
          <p className="text-sm font-semibold">Уақытыңызды үнемдеңіз</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Материалдарды бірнеше минутта дайындаңыз.</p>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7 lg:px-10">
          <button
            className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Мәзірді ашу"
          >
            <Menu className="size-5" />
          </button>
          <p className="hidden text-sm text-slate-500 sm:block">Информатика мұғалімінің цифрлық көмекшісі</p>
          {profile ? <div className="flex items-center gap-2">
            <Link href="/profile" className="hidden rounded-xl bg-blue-50 px-3 py-1.5 text-right sm:block">
              <span className="block text-xs font-bold text-blue-800">{profile.full_name}</span>
              <span className="text-[11px] text-blue-600">{profile.role === "admin" ? "Әкімші" : "Мұғалім"}</span>
            </Link>
            <Link href="/profile" aria-label="Профиль" className="grid size-9 place-items-center rounded-full border"><UserRound className="size-4" /></Link>
            <form action="/api/auth/logout" method="post"><button aria-label="Шығу" className="grid size-9 place-items-center rounded-full border text-red-600"><LogOut className="size-4" /></button></form>
          </div> : <Link href="/login" className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Кіру</Link>}
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
