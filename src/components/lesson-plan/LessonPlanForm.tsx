"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Sparkles, WandSparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ASSESSMENT_METHODS, REFLECTION_METHODS } from "@/constants/lesson-plan-template";
import { lessonPlanSchema } from "@/lib/lesson-plan-validator";
import type { LessonPlanFormValues } from "@/types/lesson-plan";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField, TextareaField } from "@/components/ui/form-fields";

const PROFILE_KEY = "it-ustaz-teacher-profile";

const defaults: LessonPlanFormValues = {
  school: "",
  teacher: "",
  date: new Date().toISOString().slice(0, 10),
  grade: "",
  presentCount: 20,
  absentCount: 0,
  section: "",
  topic: "",
  lessonNumber: 1,
  learningGoal: "",
  lessonGoal: "",
  duration: 45,
  startMinutes: 5,
  middleMinutes: 30,
  endMinutes: 10,
  specialNeeds: "",
  assessmentMethods: "Қалыптастырушы бағалау",
  reflectionMethod: "БББ",
  homework: "",
  resources: "Компьютер, интерактивті тақта, презентация, жұмыс парағы",
};

export function LessonPlanForm({
  onGenerate,
  onGenerateAi,
  aiLoading,
}: {
  onGenerate: (values: LessonPlanFormValues) => void;
  onGenerateAi: (values: LessonPlanFormValues) => void;
  aiLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonPlanFormValues>({ resolver: zodResolver(lessonPlanSchema), defaultValues: defaults });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}") as Partial<LessonPlanFormValues>;
        reset({ ...defaults, school: profile.school ?? "", teacher: profile.teacher ?? "" });
      } catch {
        reset(defaults);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [reset]);

  const submit = (values: LessonPlanFormValues) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ school: values.school, teacher: values.teacher }));
    onGenerate(values);
  };

  return (
    <Card className="no-print">
      <form onSubmit={handleSubmit(submit)} className="grid gap-6">
        <div>
          <h2 className="mb-4 text-lg font-bold">Негізгі мәліметтер</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Білім беру ұйымының атауы" registration={register("school")} error={errors.school} placeholder="№1 жалпы білім беретін мектеп" />
            <Field label="Педагогтің аты-жөні" registration={register("teacher")} error={errors.teacher} placeholder="Тегі Аты Әкесінің аты" />
            <Field type="date" label="Күні" registration={register("date")} error={errors.date} />
            <Field label="Сынып" registration={register("grade")} error={errors.grade} placeholder="6" />
            <Field type="number" label="Қатысушылар саны" registration={register("presentCount", { valueAsNumber: true })} error={errors.presentCount} />
            <Field type="number" label="Қатыспағандар саны" registration={register("absentCount", { valueAsNumber: true })} error={errors.absentCount} />
            <Field label="Бөлім" registration={register("section")} error={errors.section} placeholder="Python тілінде программалау" />
            <Field type="number" label="Сабақ нөмірі" registration={register("lessonNumber", { valueAsNumber: true })} error={errors.lessonNumber} />
            <Field label="Сабақ тақырыбы" registration={register("topic")} error={errors.topic} placeholder="Санды енгізу және шығару" />
            <Field type="number" label="Сабақ ұзақтығы (минут)" registration={register("duration", { valueAsNumber: true })} error={errors.duration} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextareaField label="Оқу мақсаты" registration={register("learningGoal")} error={errors.learningGoal} />
          <TextareaField label="Сабақ мақсаты" registration={register("lessonGoal")} error={errors.lessonGoal} />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-bold">Сабақ кезеңдерінің уақыты</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field type="number" label="Сабақтың басы" registration={register("startMinutes", { valueAsNumber: true })} error={errors.startMinutes} />
            <Field type="number" label="Сабақтың ортасы" registration={register("middleMinutes", { valueAsNumber: true })} error={errors.middleMinutes} />
            <Field type="number" label="Сабақтың соңы" registration={register("endMinutes", { valueAsNumber: true })} error={errors.endMinutes} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Бағалау әдістері" registration={register("assessmentMethods")} error={errors.assessmentMethods}>
            {ASSESSMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
          </SelectField>
          <SelectField label="Рефлексия әдісі" registration={register("reflectionMethod")} error={errors.reflectionMethod}>
            {REFLECTION_METHODS.map((method) => <option key={method}>{method}</option>)}
          </SelectField>
          <TextareaField label="Үй тапсырмасы" registration={register("homework")} error={errors.homework} placeholder="Тақырыпқа сәйкес нақты тапсырма" />
          <TextareaField label="Ресурстар" registration={register("resources")} error={errors.resources} />
          <TextareaField label="ЕБҚ оқушысына қолдау" registration={register("specialNeeds")} error={errors.specialNeeds} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting || aiLoading}>
            <WandSparkles className="size-4" /> Үлгімен құрастыру
          </Button>
          <Button type="button" variant="secondary" disabled={isSubmitting || aiLoading} onClick={handleSubmit(onGenerateAi)}>
            {aiLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {aiLoading ? "AI құрастырып жатыр..." : "AI көмегімен құрастыру"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
