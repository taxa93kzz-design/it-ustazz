import { z } from "zod";
import { ALLOWED_INTERACTIVE_HOSTS } from "@/constants/interactive-platforms";

export const interactiveSearchSchema = z.object({
  topic: z.string().trim().min(2, "Сабақ тақырыбын енгізіңіз").max(160),
  grade: z.string().trim().min(1, "Сыныпты таңдаңыз").max(20),
  learningGoal: z.string().trim().min(2, "Оқу мақсатын енгізіңіз").max(500),
  purpose: z.string().trim().min(2, "Тапсырма мақсатын енгізіңіз").max(300),
  lessonStage: z.enum(["start", "middle", "end"]),
  platform: z.enum(["wordwall", "learningapps", "quizizz", "joyteka", "gimkit", "all"]),
  activityType: z.string().trim().min(1),
  language: z.enum(["kk", "ru", "en", "all"]),
  durationMinutes: z.coerce.number().int().min(1).max(45),
  keywords: z.string().trim().max(200).optional(),
});

export const resourceUrlSchema = z.string().trim().url("Толық http(s) сілтемесін енгізіңіз").refine((value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      ALLOWED_INTERACTIVE_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}, "Тек рұқсат етілген платформаның сілтемесін енгізіңіз");

export function validateResourceUrl(value: string) {
  return resourceUrlSchema.safeParse(value);
}
