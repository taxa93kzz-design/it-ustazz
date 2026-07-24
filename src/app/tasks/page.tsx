"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, LoaderCircle, RefreshCw, Save, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Notice } from "@/components/feedback";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField, TextareaField } from "@/components/ui/form-fields";
import { requestAi } from "@/lib/ai-client";
import { exportMaterial } from "@/lib/export-word";
import { makeId } from "@/lib/utils";
import { materialStorage } from "@/services/storage";
import type { Material, TaskItem } from "@/types/material";

const taskTypes = ["Теориялық сұрақ", "Практикалық тапсырма", "Python коды", "Қатені табу", "Сәйкестендіру", "Жоба тапсырмасы"];
const schema = z.object({
  grade: z.string().min(1, "Сыныпты енгізіңіз"),
  topic: z.string().min(3, "Тақырыпты енгізіңіз"),
  learningGoal: z.string().min(5, "Оқу мақсатын енгізіңіз"),
  count: z.number().min(1, "Кемінде 1 тапсырма").max(10, "10 тапсырмадан аспауы керек"),
  type: z.string().min(1),
  level: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

function makeTasks(data: FormData): TaskItem[] {
  return Array.from({ length: data.count }, (_, index) => ({
    text: `[${data.level}] ${data.topic} тақырыбы бойынша ${index + 1}-тапсырманы орындаңыз.`,
    criteria: "Тақырып бойынша білімін дұрыс қолданады.",
    descriptor: `• тапсырма шартын түсінеді;\n• ${data.topic} бойынша білімін қолданады;\n• нәтижесін тексеріп ұсынады.`,
    answer: data.type === "Қатені табу" ? 'print("Нәтиже: " + str(5))' : "Жауап оқу мақсаты мен тапсырма шартына сай бағаланады.",
  }));
}

export default function TasksPage() {
  const [material, setMaterial] = useState<Material | null>(null);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [lastAiInput, setLastAiInput] = useState<FormData | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { count: 3, type: taskTypes[0], level: "Аралас" },
  });

  const setResult = (data: FormData, items: TaskItem[], ai = false) => {
    const now = new Date().toISOString();
    setMaterial({ id: makeId(), type: "Тапсырма", title: `${ai ? "AI тапсырмалары" : "Тапсырмалар"} — ${data.topic}`, grade: data.grade, createdAt: now, updatedAt: now, content: { ...data, items } });
    setSaved(false);
  };
  const generate = (data: FormData) => setResult(data, makeTasks(data));
  const generateAi = async (data: FormData) => {
    setAiLoading(true); setAiError(""); setLastAiInput(data);
    try {
      const result = await requestAi<{ items: TaskItem[] }>("/api/ai/tasks", data);
      setResult(data, result.items, true);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI сұрауы орындалмады");
    } finally { setAiLoading(false); }
  };
  const update = (index: number, key: keyof TaskItem, value: string) => {
    if (!material) return;
    const items = [...(material.content.items as TaskItem[])];
    items[index] = { ...items[index], [key]: value };
    setMaterial({ ...material, content: { ...material.content, items } });
  };

  return (
    <>
      <PageHeader eyebrow="Деңгейлік жұмыс" title="Тапсырма генераторы" description="Әр тапсырма бағалау критерийі, дескриптор және үлгі жауаппен беріледі." />
      <Card>
        <form onSubmit={handleSubmit(generate)} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Сынып" registration={register("grade")} error={errors.grade} placeholder="8" />
            <Field label="Тақырып" registration={register("topic")} error={errors.topic} placeholder="Python тіліндегі циклдер" />
          </div>
          <TextareaField label="Оқу мақсаты" registration={register("learningGoal")} error={errors.learningGoal} placeholder="Оқу мақсатын жазыңыз" />
          <div className="grid gap-4 md:grid-cols-3">
            <Field type="number" label="Тапсырма саны" registration={register("count", { valueAsNumber: true })} error={errors.count} />
            <SelectField label="Тапсырма түрі" registration={register("type")} error={errors.type}>{taskTypes.map((value) => <option key={value}>{value}</option>)}</SelectField>
            <SelectField label="Деңгей" registration={register("level")} error={errors.level}>{["A — жеңіл", "B — орташа", "C — күрделі", "Аралас"].map((value) => <option key={value}>{value}</option>)}</SelectField>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={aiLoading}><WandSparkles className="size-4" /> Үлгімен құрастыру</Button>
            <Button type="button" variant="secondary" disabled={aiLoading} onClick={handleSubmit(generateAi)}>
              {aiLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {aiLoading ? "AI құрастырып жатыр..." : "AI көмегімен құрастыру"}
            </Button>
          </div>
        </form>
      </Card>
      {aiError && <div className="mt-4 space-y-3"><Notice type="error">{aiError}</Notice>{lastAiInput && <Button variant="outline" onClick={() => generateAi(lastAiInput)}>Қайта сұрау</Button>}</div>}
      {material && (
        <section className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={async () => { try { await materialStorage.save(material); setSaved(true); } catch { setSaved(false); } }}><Save className="size-4" /> Сақтау</Button>
            <Button variant="outline" onClick={() => exportMaterial(material)}><Download className="size-4" /> Word жүктеу</Button>
            <Button variant="secondary" onClick={() => setMaterial(null)}><RefreshCw className="size-4" /> Жаңадан жасау</Button>
          </div>
          {saved && <Notice type="success">Тапсырмалар материалдарға сақталды.</Notice>}
          {(material.content.items as TaskItem[]).map((item, index) => (
            <Card key={index}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">{index + 1}-тапсырма</p>
              <textarea className="mb-4 min-h-20 w-full resize-y rounded-xl border border-slate-200 p-3 font-semibold" value={item.text} onChange={(event) => update(index, "text", event.target.value)} />
              <div className="grid gap-3 md:grid-cols-3">
                {([["criteria", "Бағалау критерийі"], ["descriptor", "Дескриптор"], ["answer", "Жауап / үлгі шешім"]] as const).map(([key, label]) => (
                  <label key={key} className="text-sm font-semibold">{label}<textarea className="mt-2 min-h-28 w-full resize-y rounded-xl bg-slate-50 p-3 font-normal" value={item[key]} onChange={(event) => update(index, key, event.target.value)} /></label>
                ))}
              </div>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
