"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import type { FieldError } from "react-hook-form";
import type { z } from "zod";
import { ACTIVITY_TYPES, INTERACTIVE_PLATFORMS } from "@/constants/interactive-platforms";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/form-fields";
import { interactiveSearchSchema } from "@/lib/interactive-resource-validator";
import type { InteractiveSearchInput } from "@/types/interactive-resource";

export function InteractiveResourceForm({ defaults, loading, onSubmit }: {
  defaults: Partial<InteractiveSearchInput>; loading: boolean; onSubmit: (input: InteractiveSearchInput) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof interactiveSearchSchema>, unknown, InteractiveSearchInput>({
    resolver: zodResolver(interactiveSearchSchema),
    defaultValues: { lessonStage: "middle", platform: "all", activityType: "Викторина", language: "kk", durationMinutes: 7, ...defaults },
  });
  return <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-2xl border bg-white p-4 md:grid-cols-2">
    <Field label="Сабақ тақырыбы" registration={register("topic")} error={errors.topic} />
    <Field label="Сынып" registration={register("grade")} error={errors.grade} />
    <div className="md:col-span-2"><TextareaField label="Оқу мақсаты" registration={register("learningGoal")} error={errors.learningGoal} /></div>
    <Field label="Тапсырма мақсаты" registration={register("purpose")} error={errors.purpose} />
    <SelectField label="Сабақ кезеңі" registration={register("lessonStage")}><option value="start">Сабақтың басы</option><option value="middle">Сабақтың ортасы</option><option value="end">Сабақтың соңы</option></SelectField>
    <SelectField label="Платформа" registration={register("platform")}><option value="all">Барлығы</option>{Object.entries(INTERACTIVE_PLATFORMS).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</SelectField>
    <SelectField label="Тапсырма түрі" registration={register("activityType")}>{ACTIVITY_TYPES.map((type) => <option key={type}>{type}</option>)}</SelectField>
    <SelectField label="Тілі" registration={register("language")}><option value="kk">Қазақша</option><option value="ru">Орысша</option><option value="en">Ағылшынша</option><option value="all">Барлық тіл</option></SelectField>
    <Field label="Ұзақтығы (минут)" type="number" registration={register("durationMinutes")} error={errors.durationMinutes as FieldError | undefined} />
    <Field label="Кілт сөздер" registration={register("keywords")} error={errors.keywords} />
    <Button className="md:col-span-2" disabled={loading}><Search className="size-4" />{loading ? "Ізделуде..." : "Интерактивті тапсырма іздеу"}</Button>
  </form>;
}
