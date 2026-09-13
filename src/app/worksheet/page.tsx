"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, BrainCircuit, Cpu, Download, Printer, Save, WandSparkles } from "lucide-react";
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
  grade: z.string().trim().min(1, "Сыныпты енгізіңіз"),
  topic: z.string().trim().min(3, "Тақырыпты енгізіңіз"),
  learningGoal: z.string().trim().min(5, "Оқу мақсатын енгізіңіз"),
});
type FormData = z.infer<typeof schema>;

const levelMeta = [
  { key: "levelA", title: "A ДЕҢГЕЙІ — БІЛУ ЖӘНЕ ТҮСІНУ", score: 3, color: "border-emerald-200 bg-emerald-50", heading: "bg-emerald-600" },
  { key: "levelB", title: "B ДЕҢГЕЙІ — ҚОЛДАНУ", score: 3, color: "border-blue-200 bg-blue-50", heading: "bg-blue-600" },
  { key: "levelC", title: "C ДЕҢГЕЙІ — ТАЛДАУ ЖӘНЕ БАҒАЛАУ", score: 4, color: "border-violet-200 bg-violet-50", heading: "bg-violet-600" },
] as const;

function createWorksheet(data: FormData): Material {
  const now = new Date().toISOString();
  const topic = data.topic;
  return {
    id: makeId(), type: "Жұмыс парағы", title: `ABC деңгейлік жұмыс — ${topic}`, grade: data.grade, topic, createdAt: now, updatedAt: now,
    content: {
      ...data,
      instruction: "Тапсырмаларды өз деңгейіңізге сәйкес орындаңыз. Жауаптарыңызды берілген орындарға жазыңыз.",
      levelA: `Мақсаты: «${topic}» тақырыбы бойынша негізгі ұғымдарды білу және түсіндіру.\n\n1-тапсырма. Қысқа жауап\n«${topic}» ұғымына өз сөзіңізбен анықтама беріңіз.\nЖауап: ______________________________________________\n______________________________________________________\n\n2-тапсырма. Тізім жаса\nТақырыпқа қатысты 4 негізгі элементті немесе қолданылу саласын жазыңыз.\n1. __________________  2. __________________\n3. __________________  4. __________________\n\n3-тапсырма. Сәйкестендіру\nТөрт мысалды тақырыптағы тиісті ұғымдармен сәйкестендіріңіз.\n1. Негізгі ұғым ____   A. Қолданылу нәтижесі\n2. Құрал/тәсіл ____    B. Орындалу қадамы\n3. Әрекет ____         C. Тақырып анықтамасы\n4. Нәтиже ____         D. Жұмыс құралы\n\nДескриптор:\n• негізгі ұғымды түсіндіреді — 1 балл\n• 4 элементті дұрыс атайды — 1 балл\n• сәйкестендіруді дұрыс орындайды — 1 балл\n\nБАРЛЫҒЫ: 3 БАЛЛ`,
      levelB: `Мақсаты: «${topic}» бойынша алған білімін нақты жағдайда қолдану.\n\nКестені толтырыңыз.\n\nСала/жағдай | Өмірлік мысал | Қызмет ету алгоритмі\nБілім беру | __________________ | 1.___ 2.___ 3.___ 4.___\nӨндіріс | _____________________ | 1.___ 2.___ 3.___ 4.___\nМедицина | ____________________ | 1.___ 2.___ 3.___ 4.___\nОйын индустриясы | ____________ | 1.___ 2.___ 3.___ 4.___\n\nӘр қатарда өмірден мысал келтіріп, жүйенің қызметін анықтаңыз және 3–4 қадамдық алгоритм жазыңыз.\n\nДескриптор:\n• өмірлік мысал келтіреді — 1 балл\n• қызметін дұрыс анықтайды — 1 балл\n• алгоритмді дұрыс құрады — 1 балл\n\nБАРЛЫҒЫ: 3 БАЛЛ`,
      levelC: `Мақсаты: «${topic}» тақырыбын талдау, пікір білдіру және қорытынды жасау.\n\n1-тапсырма. Проблемалық сұрақ\n«${topic}» адам өміріне қандай мүмкіндік береді және қандай қауіп тудыруы мүмкін?\n\nПОПС формуласы бойынша жауап беріңіз:\nПозиция: Менің ойымша, ______________________________\nНегіздеме: Себебі, ___________________________________\nМысал: Оны мына мысалмен дәлелдей аламын: ___________\nҚорытынды: Сондықтан, ________________________________\n\n2-тапсырма. Салыстыру\nАртықшылықтары:                 Ықтимал мәселелері:\n1. __________________          1. __________________\n2. __________________          2. __________________\n\nДескриптор:\n• өз пікірін білдіреді — 1 балл\n• кемінде 2 дәлел және нақты мысал келтіреді — 1 балл\n• артықшылық пен мәселені салыстырады — 1 балл\n• негізді қорытынды жасайды — 1 балл\n\nБАРЛЫҒЫ: 4 БАЛЛ`,
      reminder: "Тапсырманы мұқият оқыңыз • Уақытты тиімді пайдаланыңыз • Дәлелді және нақты мысал келтіріңіз • Жауаптарыңызды толық әрі түсінікті жазыңыз",
    },
  };
}

export default function WorksheetPage() {
  const [material, setMaterial] = useState<Material | null>(null);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const update = (key: string, value: string) => material && setMaterial({ ...material, content: { ...material.content, [key]: value } });

  return <>
    <PageHeader eyebrow="10 балдық бағалау" title="ABC деңгейлік жұмыс" description="A–B–C бойынша күрделенетін, баспаға дайын көлденең жұмыс парағы." />
    <Card className="no-print">
      <form onSubmit={handleSubmit((data) => { setMaterial(createWorksheet(data)); setSaved(false); })} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Сынып" registration={register("grade")} error={errors.grade} placeholder="6" />
          <Field label="Сабақ тақырыбы" registration={register("topic")} error={errors.topic} placeholder="Жасанды интеллект" />
        </div>
        <TextareaField label="Оқу мақсаты" registration={register("learningGoal")} error={errors.learningGoal} placeholder="Оқу мақсатын жазыңыз" />
        <Button className="w-fit"><WandSparkles className="size-4" /> ABC жұмыс парағын құрастыру</Button>
      </form>
    </Card>
    {material && <section className="mt-8 space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button onClick={async () => { try { await materialStorage.save(material); setSaved(true); } catch { setSaved(false); } }}><Save className="size-4" /> Сақтау</Button>
        <Button variant="outline" onClick={() => exportMaterial(material)}><Download className="size-4" /> Word жүктеу</Button>
        <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Басып шығару</Button>
      </div>
      {saved && <Notice type="success">Жұмыс парағы сақталды.</Notice>}
      <article className="worksheet-landscape overflow-hidden rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <header className="mb-5 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 p-5 text-white">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em]">Информатика · {material.grade}-сынып</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">ABC ДЕҢГЕЙЛІК ЖҰМЫС</h2><p className="mt-2 font-semibold">Тақырыбы: {String(material.content.topic)}</p></div><div className="hidden gap-2 sm:flex"><BookOpen /><Cpu /><BrainCircuit /></div></div>
          <p className="mt-3 text-sm text-blue-50">{String(material.content.instruction)}</p>
          <p className="mt-2 text-xs"><b>Оқу мақсаты:</b> {String(material.content.learningGoal)}</p>
        </header>
        <div className="grid gap-4 xl:grid-cols-3">{levelMeta.map((level) => <section key={level.key} className={`overflow-hidden rounded-2xl border ${level.color}`}>
          <h3 className={`flex min-h-16 items-center justify-between gap-2 px-4 py-3 text-sm font-black text-white ${level.heading}`}><span>{level.title}</span><span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20 text-base">{level.score}</span></h3>
          <textarea value={String(material.content[level.key])} onChange={(event) => update(level.key, event.target.value)} className="min-h-[660px] w-full resize-y bg-transparent p-4 text-xs leading-5 outline-none" aria-label={level.title} />
        </section>)}</div>
        <footer className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950"><b>Есіңізде болсын!</b> {String(material.content.reminder)} <span className="float-right font-black">Жалпы: 10 балл</span></footer>
      </article>
    </section>}
  </>;
}
