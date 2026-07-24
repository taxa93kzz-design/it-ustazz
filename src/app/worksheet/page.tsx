"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Printer, Save, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Notice } from "@/components/feedback";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextareaField } from "@/components/ui/form-fields";
import { exportMaterial } from "@/lib/export-word";
import { makeId } from "@/lib/utils";
import { materialStorage } from "@/services/storage";
import type { Material } from "@/types/material";

const schema = z.object({
  grade: z.string().min(1, "Сыныпты енгізіңіз"),
  topic: z.string().min(3, "Тақырыпты енгізіңіз"),
  learningGoal: z.string().min(5, "Оқу мақсатын енгізіңіз"),
});
type FormData = z.infer<typeof schema>;
const sections = [
  ["theory", "Қысқаша теория"], ["terms", "Негізгі терминдер"], ["levelA", "A деңгейі — жеңіл"],
  ["levelB", "B деңгейі — орташа"], ["levelC", "C деңгейі — күрделі"],
  ["selfAssessment", "Өзін-өзі бағалау"], ["reflection", "Рефлексия"],
] as const;

export default function WorksheetPage() {
  const [material, setMaterial] = useState<Material | null>(null);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const generate = (data: FormData) => {
    const now = new Date().toISOString();
    setMaterial({
      id: makeId(), type: "Жұмыс парағы", title: `Жұмыс парағы — ${data.topic}`, grade: data.grade, createdAt: now, updatedAt: now,
      content: {
        ...data,
        theory: `${data.topic} — сабақтың негізгі тақырыбы. Оқушы оқу мақсатына жету үшін негізгі ұғымдармен және оларды қолдану жолдарымен танысады.`,
        terms: "1. Негізгі ұғым — тақырыптың басты түсінігі.\n2. Алгоритм — әрекеттердің реті.\n3. Нәтиже — орындалған жұмыстың қорытындысы.",
        levelA: `${data.topic} бойынша үш негізгі терминді жазып, анықтамасын беріңіз.\n\nЖауап: __________________________________________`,
        levelB: "Практикалық мысал құрастырып, орындалу қадамдарын көрсетіңіз.\n\nЖауап: __________________________________________",
        levelC: "Шағын жоба немесе алгоритм ұсынып, таңдауыңызды негіздеңіз.\n\nЖауап: __________________________________________",
        selfAssessment: "□ Тақырыпты түсіндім  □ Тапсырманы өзім орындадым  □ Маған қосымша көмек қажет",
        reflection: "Бүгін мен білдім: ____________________\nМаған қиын болғаны: __________________\nКелесіде білгім келеді: ______________",
      },
    });
    setSaved(false);
  };
  const update = (key: string, value: string) => material && setMaterial({ ...material, content: { ...material.content, [key]: value } });

  return (
    <>
      <PageHeader eyebrow="Баспаға дайын материал" title="Жұмыс парағы" description="Теория, терминдер, үш деңгейлі тапсырма, өзін-өзі бағалау және рефлексия бір құжатта." />
      <Card className="no-print">
        <form onSubmit={handleSubmit(generate)} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Сынып" registration={register("grade")} error={errors.grade} placeholder="6" />
            <Field label="Сабақ тақырыбы" registration={register("topic")} error={errors.topic} placeholder="Ақпаратты ұсыну" />
          </div>
          <TextareaField label="Оқу мақсаты" registration={register("learningGoal")} error={errors.learningGoal} placeholder="Оқу мақсатын жазыңыз" />
          <Button className="w-fit"><WandSparkles className="size-4" /> Жұмыс парағын құрастыру</Button>
        </form>
      </Card>
      {material && (
        <section className="mt-8 space-y-4">
          <div className="no-print flex flex-wrap gap-2">
            <Button onClick={async () => { try { await materialStorage.save(material); setSaved(true); } catch { setSaved(false); } }}><Save className="size-4" /> Сақтау</Button>
            <Button variant="outline" onClick={() => exportMaterial(material)}><Download className="size-4" /> Word жүктеу</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Басып шығару</Button>
          </div>
          {saved && <Notice type="success">Жұмыс парағы сақталды.</Notice>}
          <Card className="p-6 sm:p-10">
            <div className="mb-7 border-b-2 border-slate-900 pb-5 text-center">
              <p className="text-sm text-slate-500">{material.grade}-сынып</p>
              <h2 className="mt-1 text-2xl font-bold">{material.title}</h2>
              <p className="mt-2 text-sm"><b>Оқу мақсаты:</b> {String(material.content.learningGoal)}</p>
            </div>
            <div className="space-y-6">{sections.map(([key, label]) => (
              <section key={key}><h3 className="mb-2 rounded-lg bg-blue-50 px-3 py-2 font-bold text-blue-900">{label}</h3><textarea value={String(material.content[key])} onChange={(event) => update(key, event.target.value)} className="min-h-24 w-full resize-y rounded-xl p-2 leading-7 outline-none hover:border hover:border-slate-200" /></section>
            ))}</div>
          </Card>
        </section>
      )}
    </>
  );
}
