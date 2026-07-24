"use client";

import { LessonPlanTable } from "./LessonPlanTable";
import { LESSON_PLAN_TITLE, LESSON_PROCESS_TITLE } from "@/constants/lesson-plan-template";
import type { LessonPlan } from "@/types/lesson-plan";
import { Card } from "@/components/ui/card";

export function LessonPlanPreview({ plan, onChange }: { plan: LessonPlan; onChange: (plan: LessonPlan) => void }) {
  const info = [
    ["Бөлім:", plan.section],
    ["Педагогтің тегі, аты, әкесінің аты", plan.teacher],
    ["Күні:", plan.date],
    ["Сабақтың тақырыбы", plan.topic],
    ["Оқу бағдарламасына сәйкес оқыту мақсаттары", plan.learningGoal],
    ["Сабақтың мақсаты", plan.lessonGoal],
  ];
  return (
    <Card className="font-['Times_New_Roman'] text-[12pt] leading-none text-black">
      <div className="mb-2 text-center leading-none">
        <p>{plan.school}</p>
        <p>({plan.school})</p>
        <h2 className="font-bold">{LESSON_PLAN_TITLE}</h2>
        <p className="font-bold">{plan.topic} ({plan.lessonNumber} сабақ)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="mb-4 w-full min-w-[700px] table-fixed border-collapse text-[12pt] leading-tight">
          <colgroup><col className="w-[35.48%]" /><col className="w-[32.92%]" /><col className="w-[31.6%]" /></colgroup>
          <tbody>
            {info.slice(0, 3).map(([label, value]) => <tr key={label}><th className="w-[27%] border border-black p-2 text-left">{label}</th><td className="border border-black p-2">{value}</td></tr>)}
            <tr><th className="border border-black p-2 text-left">Сынып: {plan.grade}</th><td className="border border-black p-2">Қатысушылар саны: {plan.presentCount}</td><td className="border border-black p-2">Қатыспағандар саны: {plan.absentCount}</td></tr>
            {info.slice(3).map(([label, value]) => <tr key={label}><th className="w-[27%] border border-black p-2 text-left">{label}</th><td colSpan={2} className="border border-black p-2">{value}</td></tr>)}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 text-center font-bold">{LESSON_PROCESS_TITLE}</h2>
      <LessonPlanTable stages={plan.stages} onChange={(stages) => onChange({ ...plan, stages })} />
    </Card>
  );
}
