import { z } from "zod";

export const aiBaseInputSchema = z.object({
  grade: z.string().trim().min(1, "Сыныпты енгізіңіз").max(20),
  topic: z.string().trim().min(3, "Тақырыпты енгізіңіз").max(300),
  learningGoal: z.string().trim().min(5, "Оқу мақсатын енгізіңіз").max(1000),
});

export const aiLessonInputSchema = aiBaseInputSchema.extend({
  lessonGoal: z.string().trim().min(5).max(1000),
  duration: z.number().int().min(20).max(180),
  startMinutes: z.number().int().min(1),
  middleMinutes: z.number().int().min(1),
  endMinutes: z.number().int().min(1),
  homework: z.string().trim().min(3).max(1000),
  reflectionMethod: z.string().trim().min(2).max(100),
  specialNeeds: z.string().trim().max(1000).optional().default(""),
}).refine(
  (data) => data.startMinutes + data.middleMinutes + data.endMinutes === data.duration,
  { message: "Кезеңдер уақыты сабақ ұзақтығына тең болуы керек", path: ["duration"] },
);

export const aiLessonOutputSchema = z.object({
  stages: z.array(z.object({
    stage: z.enum(["Сабақтың басы", "Сабақтың ортасы", "Сабақтың соңы"]),
    teacherActivity: z.string().min(10),
    studentActivity: z.string().min(10),
    assessment: z.string().min(3),
    resources: z.string().min(2),
  })).length(3),
});

export const aiTaskInputSchema = aiBaseInputSchema.extend({
  count: z.number().int().min(1).max(10),
  type: z.string().trim().min(2).max(100),
  level: z.string().trim().min(1).max(50),
});

export const aiTaskOutputSchema = z.object({
  items: z.array(z.object({
    text: z.string().min(5),
    criteria: z.string().min(3),
    descriptor: z.string().min(3),
    answer: z.string().min(1),
  })).min(1).max(10),
});

export const aiTestInputSchema = aiBaseInputSchema.extend({
  count: z.number().int().min(1).max(15),
  difficulty: z.string().trim().min(2).max(50),
  type: z.string().trim().min(2).max(100),
});

export const aiTestOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string().min(5),
    options: z.array(z.string().min(1)).min(2).max(6),
    answer: z.string().min(1),
  })).min(1).max(15),
});
