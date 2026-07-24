"use client";

import { ImagePlus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { LessonPlanStage } from "@/types/lesson-plan";

const columns = [
  ["teacherActivity", "Педагогтің әрекеті"],
  ["studentActivity", "Оқушының әрекеті"],
  ["assessment", "Бағалау"],
  ["resources", "Ресурстар"],
] as const;

export function LessonPlanTable({
  stages,
  onChange,
}: {
  stages: LessonPlanStage[];
  onChange: (stages: LessonPlanStage[]) => void;
}) {
  const update = (index: number, patch: Partial<LessonPlanStage>) => {
    const next = [...stages];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const addRow = () => {
    const endIndex = Math.max(1, stages.findIndex((stage) => stage.stage === "Сабақтың соңы"));
    const next = [...stages];
    next.splice(endIndex, 0, {
      id: crypto.randomUUID(),
      stage: "Сабақтың ортасы",
      minutes: 0,
      teacherActivity: "Қосымша тапсырманы түсіндіреді.",
      studentActivity: "Тапсырманы орындайды.",
      assessment: "Дескриптор бойынша бағалау.",
      resources: "Жұмыс парағы.",
    });
    onChange(next);
  };
  const upload = (index: number, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => update(index, { image: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] table-fixed border-collapse text-[13px]">
          <colgroup><col className="w-[10.58%]" /><col className="w-[38.8%]" /><col className="w-[21.36%]" /><col className="w-[16.02%]" /><col className="w-[13.24%]" /></colgroup>
          <thead><tr>{["Сабақтың кезеңі/уақыт", ...columns.map(([, label]) => label)].map((label) => <th key={label} className="border border-black bg-slate-100 p-2 text-left">{label}</th>)}</tr></thead>
          <tbody>
            {stages.map((stage, index) => (
              <tr key={stage.id}>
                <td className="border border-black p-2 align-top">
                  <strong>{stage.stage}</strong>
                  <input type="number" value={stage.minutes} onChange={(e) => update(index, { minutes: Number(e.target.value) })} className="mt-2 w-full rounded border border-slate-200 p-1" aria-label={`${stage.stage} уақыты`} />
                  <span className="text-xs text-slate-500">минут</span>
                  {stages.length > 3 && stage.stage === "Сабақтың ортасы" && <Button size="sm" variant="danger" className="mt-3" onClick={() => onChange(stages.filter((item) => item.id !== stage.id))}><Trash2 className="size-3" /> Жою</Button>}
                </td>
                {columns.map(([key]) => (
                  <td key={key} className="border border-black p-2 align-top">
                    <textarea value={stage[key]} onChange={(e) => update(index, { [key]: e.target.value })} className="min-h-44 w-full resize-y bg-transparent leading-5 outline-none" />
                    {key === "teacherActivity" && (
                      <div className="no-print mt-2">
                        {stage.image && <Image src={stage.image} alt="Тапсырма суреті" width={240} height={160} unoptimized className="mb-2 max-h-40 max-w-full rounded object-contain" />}
                        <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-blue-600">
                          <ImagePlus className="size-4" /> Сурет қосу
                          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => upload(index, e.target.files?.[0])} />
                        </label>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" className="no-print mt-3" onClick={addRow}><Plus className="size-4" /> Тапсырма жолын қосу</Button>
    </div>
  );
}
