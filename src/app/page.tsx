"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, ClipboardCheck, FileText, GraduationCap, Layers3, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/feedback";
import { useMaterials } from "@/hooks/use-materials";
import { formatDate } from "@/lib/utils";

const actions = [
  { href: "/kmzh", label: "ҚМЖ жасау", text: "Сабақ жоспарын кестемен құрастырыңыз", icon: BookOpenCheck, type: "ҚМЖ" },
  { href: "/tests", label: "Тест жасау", text: "Жауап кілті бар тест дайындаңыз", icon: ClipboardCheck, type: "Тест" },
  { href: "/tasks", label: "Тапсырма жасау", text: "Деңгейлік тапсырмалар алыңыз", icon: FileText, type: "Тапсырма" },
  { href: "/worksheet", label: "Жұмыс парағын жасау", text: "Баспаға дайын парақ әзірлеңіз", icon: GraduationCap, type: "Жұмыс парағы" },
] as const;

export default function HomePage() {
  const { materials, loading } = useMaterials();
  const counts = actions.map((action) => ({
    ...action,
    count: materials.filter((material) => material.type === action.type).length,
  }));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
            <Sparkles className="size-4" /> Мұғалімге арналған ақылды құралдар
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Сабақ материалдарын оңай әрі жылдам дайындаңыз
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            IT Ustaz — информатика мұғалімінің ҚМЖ, тест, тапсырма және жұмыс парағын жасауға арналған цифрлық көмекшісі.
          </p>
          <Link href="/kmzh" className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold hover:bg-blue-500">
            ҚМЖ жасауды бастау <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div><p className="text-sm font-semibold text-blue-600">Жылдам бастау</p><h2 className="mt-1 text-xl font-bold">Қандай материал жасайсыз?</h2></div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><Layers3 className="size-4" /> Барлығы: {materials.length}</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {counts.map((item) => (
            <Link href={item.href} key={item.href}>
              <Card className="group h-full transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
                <div className="mb-5 flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><item.icon className="size-5" /></span>
                  <span className="text-2xl font-bold text-slate-200">{item.count}</span>
                </div>
                <h3 className="font-bold text-slate-900">{item.label}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">Бастау <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Соңғы материалдар</h2>
          <Link href="/materials" className="text-sm font-semibold text-blue-600 hover:underline">Барлығын көру</Link>
        </div>
        {loading ? <LoadingState /> : materials.length === 0 ? (
          <EmptyState title="Материалдар әлі жоқ" text="Алғашқы материалды жоғарыдағы құралдардың бірімен жасаңыз." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {materials.slice(0, 5).map((material) => (
              <Link href={`/materials?open=${material.id}`} key={material.id} className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50">
                <div><p className="font-semibold text-slate-900">{material.title}</p><p className="mt-1 text-xs text-slate-500">{material.type} · {material.grade}-сынып</p></div>
                <span className="text-xs text-slate-400">{formatDate(material.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
