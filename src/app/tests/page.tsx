"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, LoaderCircle, RotateCcw, Save, Sparkles, WandSparkles } from "lucide-react";
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
import type { Material, TestQuestion } from "@/types/material";

const questionTypes = ["Бір дұрыс жауап", "Бірнеше дұрыс жауап", "Дұрыс немесе бұрыс", "Сәйкестендіру", "Код нәтижесін анықтау"];
const schema = z.object({
  grade: z.string().min(1, "Сыныпты енгізіңіз"),
  topic: z.string().min(3, "Тақырыпты енгізіңіз"),
  learningGoal: z.string().min(5, "Оқу мақсатын енгізіңіз"),
  count: z.number().min(1, "Кемінде 1 сұрақ").max(15, "15 сұрақтан аспауы керек"),
  difficulty: z.string(),
  type: z.string(),
});
type FormData = z.infer<typeof schema>;

function makeQuestions(data: FormData): TestQuestion[] {
  return Array.from({ length: data.count }, (_, index) => {
    if (data.type === "Дұрыс немесе бұрыс") return { question: `${data.topic} туралы ${index + 1}-тұжырым дұрыс па?`, options: ["A) Дұрыс", "B) Бұрыс"], answer: index % 2 ? "B" : "A" };
    if (data.type === "Код нәтижесін анықтау") return { question: `Код нәтижесін анықтаңыз: print(${index + 2} * 2)`, options: [`A) ${index + 2}`, `B) ${(index + 2) * 2}`, `C) ${(index + 2) ** 2}`, "D) Қате"], answer: "B" };
    return { question: `${data.topic} тақырыбы бойынша дұрыс жауапты таңдаңыз.`, options: ["A) Дұрыс жауап", "B) Қате жауап", "C) Байланыссыз ұғым", "D) Ешқайсысы"], answer: "A" };
  });
}

export default function TestsPage() {
  const [material, setMaterial] = useState<Material | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ score: number; percent: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [lastAiInput, setLastAiInput] = useState<FormData | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { count: 5, difficulty: "Орташа", type: questionTypes[0], learningGoal: "" },
  });

  const setTest = (data: FormData, questions: TestQuestion[], ai = false) => {
    const now = new Date().toISOString();
    setMaterial({ id: makeId(), type: "Тест", title: `${ai ? "AI тест" : "Тест"} — ${data.topic}`, grade: data.grade, createdAt: now, updatedAt: now, content: { ...data, questions } });
    setAnswers({}); setResult(null); setSaved(false);
  };
  const generate = (data: FormData) => setTest(data, makeQuestions(data));
  const generateAi = async (data: FormData) => {
    setAiLoading(true); setAiError(""); setLastAiInput(data);
    try {
      const response = await requestAi<{ questions: TestQuestion[] }>("/api/ai/tests", data);
      setTest(data, response.questions, true);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI сұрауы орындалмады");
    } finally { setAiLoading(false); }
  };
  const check = () => {
    if (!material) return;
    const questions = material.content.questions as TestQuestion[];
    const score = questions.filter((question, index) => (answers[index] ?? "").split(",").sort().join(",") === question.answer.split(",").sort().join(",")).length;
    setResult({ score, percent: Math.round(score / questions.length * 100) });
  };
  const choose = (index: number, letter: string, multiple: boolean) => {
    if (!multiple) return setAnswers((current) => ({ ...current, [index]: letter }));
    const current = (answers[index] ?? "").split(",").filter(Boolean);
    setAnswers((values) => ({ ...values, [index]: current.includes(letter) ? current.filter((value) => value !== letter).join(",") : [...current, letter].join(",") }));
  };

  return (
    <>
      <PageHeader eyebrow="Білімді тексеру" title="Тест генераторы" description="Тестті орындап, балл, пайыз және нәтижені бірден көріңіз." />
      <Card>
        <form onSubmit={handleSubmit(generate)} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Сынып" registration={register("grade")} error={errors.grade} placeholder="9" />
            <Field label="Тақырып" registration={register("topic")} error={errors.topic} placeholder="Деректер қоры" />
          </div>
          <TextareaField label="Оқу мақсаты" registration={register("learningGoal")} error={errors.learningGoal} placeholder="Оқу мақсатын жазыңыз" />
          <div className="grid gap-4 md:grid-cols-3">
            <Field type="number" label="Сұрақ саны" registration={register("count", { valueAsNumber: true })} error={errors.count} />
            <SelectField label="Қиындық деңгейі" registration={register("difficulty")} error={errors.difficulty}>{["Жеңіл", "Орташа", "Күрделі", "Аралас"].map((value) => <option key={value}>{value}</option>)}</SelectField>
            <SelectField label="Сұрақ түрі" registration={register("type")} error={errors.type}>{questionTypes.map((value) => <option key={value}>{value}</option>)}</SelectField>
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
            <Button variant="secondary" onClick={() => { setMaterial(null); setResult(null); }}><RotateCcw className="size-4" /> Жаңа тест</Button>
          </div>
          {saved && <Notice type="success">Тест материалдарға сақталды.</Notice>}
          <Card className="space-y-6">
            <h2 className="text-xl font-bold">{material.title}</h2>
            {(material.content.questions as TestQuestion[]).map((question, index) => (
              <fieldset key={index} className="border-b border-slate-100 pb-5">
                <legend className="mb-3 font-semibold">{index + 1}. {question.question}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const letter = option[0];
                    const active = (answers[index] ?? "").split(",").includes(letter);
                    return <button type="button" key={option} onClick={() => choose(index, letter, material.content.type === "Бірнеше дұрыс жауап")} className={`rounded-xl border p-3 text-left text-sm ${active ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>{option}</button>;
                  })}
                </div>
              </fieldset>
            ))}
            <Button onClick={check}>Тестті аяқтау</Button>
          </Card>
          {result && <Card className="bg-slate-950 text-white"><div className="grid gap-5 sm:grid-cols-3"><div><p className="text-sm text-slate-400">Жинаған балл</p><p className="text-3xl font-bold">{result.score} / {(material.content.questions as TestQuestion[]).length}</p></div><div><p className="text-sm text-slate-400">Пайыз</p><p className="text-3xl font-bold">{result.percent}%</p></div><div><p className="text-sm text-slate-400">Нәтиже</p><p className="text-2xl font-bold text-blue-300">{result.percent >= 80 ? "Өте жақсы" : result.percent >= 50 ? "Жақсы" : "Қайталау қажет"}</p></div></div></Card>}
        </section>
      )}
    </>
  );
}
