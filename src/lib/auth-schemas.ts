import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email немесе логин енгізіңіз").max(150),
  password: z.string().min(1, "Пароль енгізіңіз").max(200),
  remember: z.boolean().default(false),
});

export const emailSchema = z.object({ email: z.string().trim().email("Email мекенжайы қате") });

export const passwordSchema = z.string().min(10, "Пароль кемінде 10 таңба болуы тиіс")
  .regex(/[A-ZА-ЯӘІҢҒҮҰҚӨҺ]/, "Кемінде бір бас әріп қажет")
  .regex(/[a-zа-яәіңғүұқөһ]/, "Кемінде бір кіші әріп қажет")
  .regex(/\d/, "Кемінде бір сан қажет");

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/, "Логин пішімі қате"),
  email: z.string().email(),
  schoolName: z.string().trim().min(2).max(160),
  role: z.enum(["admin", "teacher"]),
  password: passwordSchema,
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  schoolName: z.string().trim().min(2).max(160),
});

export const materialInputSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["ҚМЖ", "Тапсырма", "Тест", "Жұмыс парағы"]),
  title: z.string().trim().min(1).max(200),
  grade: z.string().trim().min(1).max(20),
  topic: z.string().trim().max(200).default(""),
  content: z.record(z.string(), z.unknown()),
});
