"use client";

import { Copy, Download, ExternalLink, Pencil, Search, Trash2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { EmptyState, LoadingState, Notice } from "@/components/feedback";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { exportMaterial } from "@/lib/export-word";
import { formatDate } from "@/lib/utils";
import { materialStorage } from "@/services/storage";
import type { Material, MaterialType } from "@/types/material";

function MaterialsContent() {
  const params = useSearchParams();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("Барлығы");
  const [type, setType] = useState("Барлығы");
  const [selected, setSelected] = useState<Material | null>(null);
  const [notice, setNotice] = useState("");
  const refresh = async () => {
    try { setItems(await materialStorage.getAll()); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Материалдарды жүктеу мүмкін болмады"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(async () => {
      await refresh();
      const open = params.get("open");
      if (open) setSelected(await materialStorage.get(open) ?? null);
    });
    return () => cancelAnimationFrame(frame);
  }, [params]);

  const grades = [...new Set(items.map((item) => item.grade))].sort();
  const filtered = useMemo(() => items.filter((item) =>
    item.title.toLocaleLowerCase("kk").includes(query.toLocaleLowerCase("kk")) &&
    (grade === "Барлығы" || item.grade === grade) &&
    (type === "Барлығы" || item.type === type)
  ), [items, query, grade, type]);

  const remove = async (id: string) => {
    if (!window.confirm("Материалды жоюға сенімдісіз бе?")) return;
    try { await materialStorage.remove(id); setSelected(null); await refresh(); setNotice("Материал жойылды."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Материал жойылмады"); }
  };

  return (
    <>
      <PageHeader eyebrow="Жеке кітапхана" title="Менің материалдарым" description="Сақталған материалдарды іздеңіз, сүзгілеңіз, көшіріңіз немесе Word форматына жүктеңіз." />
      {notice && <div className="mb-4"><Notice type="success">{notice}</Notice></div>}
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Материал атауы бойынша іздеу" className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 outline-none focus:border-blue-500" />
          </label>
          <select value={grade} onChange={(event) => setGrade(event.target.value)} className="h-11 rounded-xl border border-slate-200 px-3"><option>Барлығы</option>{grades.map((value) => <option key={value}>{value}</option>)}</select>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-11 rounded-xl border border-slate-200 px-3"><option>Барлығы</option>{(["ҚМЖ", "Тапсырма", "Тест", "Жұмыс парағы"] satisfies MaterialType[]).map((value) => <option key={value}>{value}</option>)}</select>
        </div>
      </Card>
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title={items.length ? "Нәтиже табылмады" : "Сақталған материалдар жоқ"} text={items.length ? "Іздеу сөзін немесе сүзгілерді өзгертіп көріңіз." : "Генераторда материал жасап, «Сақтау» батырмасын басыңыз."} />
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2"><span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{item.type}</span><span className="text-xs text-slate-400">{item.grade}-сынып</span></div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-500">Жасалған күні: {formatDate(item.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" title="Ашу" onClick={() => setSelected(item)}><ExternalLink className="size-4" /><span className="sm:hidden">Ашу</span></Button>
                <Button size="sm" variant="ghost" title="Өзгерту" onClick={() => setSelected(item)}><Pencil className="size-4" /></Button>
                <Button size="sm" variant="ghost" title="Көшіру" onClick={async () => { await materialStorage.duplicate(item.id); await refresh(); setNotice("Материал көшірілді."); }}><Copy className="size-4" /></Button>
                <Button size="sm" variant="ghost" title="Word жүктеу" onClick={() => exportMaterial(item)}><Download className="size-4" /></Button>
                <Button size="sm" variant="danger" title="Жою" onClick={() => remove(item.id)}><Trash2 className="size-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Материалды ашу">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><span className="text-xs font-bold text-blue-600">{selected.type} · {selected.grade}-сынып</span><h2 className="mt-1 text-xl font-bold">{selected.title}</h2></div>
              <Button size="icon" variant="ghost" onClick={() => setSelected(null)} aria-label="Жабу"><X className="size-5" /></Button>
            </div>
            <label className="grid gap-2 text-sm font-semibold">Материал атауы<input value={selected.title} onChange={(event) => setSelected({ ...selected, title: event.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 font-normal" /></label>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-6 text-slate-600">{JSON.stringify(selected.content, null, 2)}</pre>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={async () => { await materialStorage.save({ ...selected, updatedAt: new Date().toISOString() }); await refresh(); setNotice("Өзгеріс сақталды."); setSelected(null); }}>Өзгерісті сақтау</Button>
              <Button variant="outline" onClick={() => exportMaterial(selected)}><Download className="size-4" /> Word жүктеу</Button>
              <Button variant="danger" onClick={() => remove(selected.id)}><Trash2 className="size-4" /> Жою</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default function MaterialsPage() {
  return <Suspense fallback={<LoadingState />}><MaterialsContent /></Suspense>;
}
