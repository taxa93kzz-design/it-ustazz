"use client";

import { Copy, Download, Plus, Printer, Save } from "lucide-react";
import { useState } from "react";
import { Notice } from "@/components/feedback";
import { LessonPlanForm } from "@/components/lesson-plan/LessonPlanForm";
import { LessonPlanPreview } from "@/components/lesson-plan/LessonPlanPreview";
import { InteractiveResourceSearch } from "@/components/interactive-resources/InteractiveResourceSearch";
import { InteractiveResourceList } from "@/components/interactive-resources/InteractiveResourceList";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { exportLessonPlanDocx } from "@/lib/lesson-plan-docx";
import { generateLessonPlan } from "@/lib/lesson-plan-generator";
import { validateLessonPlan } from "@/lib/lesson-plan-validator";
import { requestAi } from "@/lib/ai-client";
import type { z } from "zod";
import { aiLessonOutputSchema } from "@/lib/ai-schemas";
import { makeId } from "@/lib/utils";
import { materialStorage } from "@/services/storage";
import { interactiveResourceStorage } from "@/services/interactive-resource-storage";
import type { LessonPlan, LessonPlanFormValues } from "@/types/lesson-plan";
import type { InteractiveResource } from "@/types/interactive-resource";
import type { Material } from "@/types/material";

function toMaterial(plan: LessonPlan): Material {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    type: "ҚМЖ",
    title: `ҚМЖ — ${plan.topic}`,
    grade: plan.grade,
    createdAt: now,
    updatedAt: now,
    content: {
      ...plan,
      stages: plan.stages.map((stage) => ({
        stage: stage.stage,
        time: `${stage.minutes} минут`,
        teacher: stage.teacherActivity,
        student: stage.studentActivity,
        assessment: stage.assessment,
        resources: stage.resources,
        image: stage.image,
        interactiveResourceIds: stage.interactiveResourceIds,
      })),
      interactiveResources: plan.interactiveResources,
    },
  };
}

export default function KmzhPage() {
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastAiInput, setLastAiInput] = useState<LessonPlanFormValues | null>(null);

  const generate = (values: LessonPlanFormValues) => {
    setPlan(generateLessonPlan(values));
    setNotice(null);
    setTimeout(() => document.getElementById("lesson-plan-preview")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const generateAi = async (values: LessonPlanFormValues) => {
    setAiLoading(true);
    setLastAiInput(values);
    setNotice(null);
    try {
      const result = await requestAi<z.infer<typeof aiLessonOutputSchema>>("/api/ai/lesson-plan", values);
      const base = generateLessonPlan(values);
      setPlan({
        ...base,
        stages: base.stages.map((stage, index) => ({ ...stage, ...result.stages[index] })),
      });
      setNotice({ type: "success", text: "AI ҚМЖ мазмұнын дайындады. Барлық ұяшықты өңдей аласыз." });
      setTimeout(() => document.getElementById("lesson-plan-preview")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "AI сұрауы орындалмады" });
    } finally {
      setAiLoading(false);
    }
  };

  const ensureValid = () => {
    if (!plan) return false;
    const errors = validateLessonPlan(plan);
    if (errors.length) {
      setNotice({ type: "error", text: errors[0] });
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!plan || !ensureValid()) return;
    try {
      await materialStorage.save(toMaterial(plan));
      setNotice({ type: "success", text: "ҚМЖ «Менің материалдарым» бөліміне сақталды." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "ҚМЖ сақталмады" });
    }
  };

  const download = async () => {
    if (!plan || !ensureValid()) return;
    try {
      await exportLessonPlanDocx(plan);
      setNotice({ type: "success", text: "Word құжаты дайындалды." });
    } catch {
      setNotice({ type: "error", text: "Word құжатын жасау кезінде қате шықты. Қайталап көріңіз." });
    }
  };

  const copy = async () => {
    if (!plan) return;
    const text = plan.stages.map((stage) =>
      `${stage.stage} — ${stage.minutes} минут\n${stage.teacherActivity}\n${stage.studentActivity}\n${stage.assessment}\n${stage.resources}`,
    ).join("\n\n");
    await navigator.clipboard.writeText(`${plan.school}\nҚысқа мерзімді (сабақ) жоспары\n${plan.topic}\n\n${text}`);
    setNotice({ type: "success", text: "ҚМЖ мәтіні көшірілді." });
  };

  const addInteractiveResource = (resource: InteractiveResource) => {
    if (!plan || !resource.verifiedByTeacher) return;
    const stageIndex = { start: 0, middle: 1, end: 2 }[resource.lessonStage];
    const descriptorText = resource.descriptors.slice(0, 4).map((item) => `- ${item};`).join("\n");
    const teacherBlock = `\n\nИнтерактивті тапсырма: «${resource.title}» (${resource.durationMinutes ?? 5} минут). Мұғалім тапсырманы ашады, орындалу тәртібін түсіндіреді және нәтижені бақылайды.\nДескриптор:\n${descriptorText}`;
    const studentBlock = `\n\n«${resource.title}» интерактивті тапсырмасын орындайды, жауабын тексереді және нәтижесін түсіндіреді.`;
    const assessmentBlock = `\n\nҚалыптастырушы бағалау: платформа нәтижесі және ${resource.descriptors.slice(0, 2).join("; ")}.`;
    const resourceBlock = `\n\n${resource.title}\n${resource.url}`;
    setPlan({
      ...plan,
      interactiveResources: [...plan.interactiveResources.filter((item) => item.id !== resource.id), resource],
      stages: plan.stages.map((stage, index) => index !== stageIndex ? stage : {
        ...stage,
        teacherActivity: stage.teacherActivity + teacherBlock,
        studentActivity: stage.studentActivity + studentBlock,
        assessment: stage.assessment + assessmentBlock,
        resources: stage.resources + resourceBlock,
        interactiveResourceIds: [...(stage.interactiveResourceIds ?? []), resource.id],
      }),
    });
    interactiveResourceStorage.save(resource);
    setNotice({ type: "success", text: "Интерактивті тапсырма ҚМЖ-ға қосылды. Кестедегі мәтінді еркін өңдей аласыз." });
  };

  const removeInteractiveResource = (id: string) => {
    if (!plan) return;
    setPlan({
      ...plan,
      interactiveResources: plan.interactiveResources.filter((item) => item.id !== id),
      stages: plan.stages.map((stage) => ({ ...stage, interactiveResourceIds: stage.interactiveResourceIds?.filter((item) => item !== id) })),
    });
    interactiveResourceStorage.remove(id);
  };

  return (
    <>
      <PageHeader
        eyebrow="Сабақ жоспары"
        title="ҚМЖ генераторы"
        description="Қатаң құрылымдағы қысқа мерзімді жоспарды толтырыңыз, веб-редакторда өзгертіңіз және A4 Word құжатына жүктеңіз."
      />
      <LessonPlanForm onGenerate={generate} onGenerateAi={generateAi} aiLoading={aiLoading} />
      {notice?.type === "error" && !plan && (
        <div className="mt-4 space-y-3">
          <Notice type="error">{notice.text}</Notice>
          {lastAiInput && <Button variant="outline" disabled={aiLoading} onClick={() => generateAi(lastAiInput)}>Қайта сұрау</Button>}
        </div>
      )}
      {plan && (
        <section id="lesson-plan-preview" className="mt-8 space-y-4">
          <div className="no-print flex flex-wrap gap-2">
            <Button onClick={save}><Save className="size-4" /> Сақтау</Button>
            <Button variant="outline" onClick={download}><Download className="size-4" /> Word жүктеу</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Басып шығару</Button>
            <Button variant="outline" onClick={copy}><Copy className="size-4" /> Көшіріп алу</Button>
            <Button variant="secondary" onClick={() => { setPlan(null); setNotice(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Plus className="size-4" /> Жаңа ҚМЖ</Button>
          </div>
          {notice && <div className="no-print"><Notice type={notice.type}>{notice.text}</Notice></div>}
          {notice?.type === "error" && lastAiInput && <Button className="no-print" variant="outline" disabled={aiLoading} onClick={() => generateAi(lastAiInput)}>Қайта сұрау</Button>}
          <LessonPlanPreview plan={plan} onChange={setPlan} />
          <InteractiveResourceSearch
            defaults={{ topic: plan.topic, grade: plan.grade, learningGoal: plan.learningGoal, purpose: plan.lessonGoal }}
            onAdd={addInteractiveResource}
          />
          {plan.interactiveResources.length > 0 && (
            <section className="no-print grid gap-3">
              <h2 className="text-lg font-bold">ҚМЖ-ға қосылған интерактивті ресурстар</h2>
              <InteractiveResourceList resources={plan.interactiveResources} onDelete={removeInteractiveResource} />
            </section>
          )}
        </section>
      )}
    </>
  );
}
