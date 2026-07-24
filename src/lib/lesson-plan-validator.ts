import { z } from "zod";
import type { LessonPlan } from "@/types/lesson-plan";

export const lessonPlanSchema = z
  .object({
    school: z.string().min(2, "Білім беру ұйымының атауын енгізіңіз"),
    teacher: z.string().min(3, "Педагогтің аты-жөнін енгізіңіз"),
    date: z.string().min(1, "Күнін таңдаңыз"),
    grade: z.string().min(1, "Сыныпты енгізіңіз"),
    presentCount: z.number().min(0, "Қатысушылар саны теріс болмауы керек").max(50),
    absentCount: z.number().min(0, "Қатыспағандар саны теріс болмауы керек").max(50),
    section: z.string().min(2, "Бөлімді енгізіңіз"),
    topic: z.string().min(3, "Сабақ тақырыбын енгізіңіз"),
    lessonNumber: z.number().min(1, "Сабақ нөмірін енгізіңіз"),
    learningGoal: z.string().min(5, "Оқу мақсаты енгізілмеген"),
    lessonGoal: z.string().min(5, "Сабақ мақсаты енгізілмеген"),
    duration: z.number().min(20).max(180),
    startMinutes: z.number().min(1),
    middleMinutes: z.number().min(1),
    endMinutes: z.number().min(1),
    specialNeeds: z.string(),
    assessmentMethods: z.string().min(2, "Бағалау әдісін таңдаңыз"),
    reflectionMethod: z.string().min(2, "Рефлексия әдісін таңдаңыз"),
    homework: z.string().min(3, "Үй тапсырмасын енгізіңіз"),
    resources: z.string().min(2, "Ресурстарды енгізіңіз"),
  })
  .superRefine((data, ctx) => {
    const total = data.startMinutes + data.middleMinutes + data.endMinutes;
    if (total !== data.duration) {
      ctx.addIssue({
        code: "custom",
        path: ["startMinutes"],
        message: `Сабақ кезеңдерінің жалпы уақыты ${data.duration} минут болуы керек (қазір ${total} минут)`,
      });
    }
    if (data.absentCount > data.presentCount) {
      ctx.addIssue({
        code: "custom",
        path: ["absentCount"],
        message: "Қатыспағандар саны қатысушылар санынан көп болмауы керек",
      });
    }
  });

export function validateLessonPlan(plan: LessonPlan): string[] {
  const errors: string[] = [];
  if (plan.stages.reduce((sum, stage) => sum + stage.minutes, 0) !== plan.duration) {
    errors.push(`Сабақ кезеңдерінің жалпы уақыты ${plan.duration} минут болуы керек`);
  }
  plan.stages.forEach((stage) => {
    if (!stage.teacherActivity.trim()) errors.push(`${stage.stage}: педагог әрекетін толтырыңыз`);
    if (!stage.studentActivity.trim()) errors.push(`${stage.stage}: оқушы әрекетін толтырыңыз`);
    if (!stage.resources.trim()) errors.push(`${stage.stage}: ресурстарды көрсетіңіз`);
  });
  if (!plan.homework.trim()) errors.push("Үй тапсырмасы енгізілмеген");
  if (!plan.reflectionMethod.trim()) errors.push("Рефлексия әдісі таңдалмаған");
  return errors;
}
