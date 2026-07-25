import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_500),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(2, "Сұрағыңызды жазыңыз").max(1_500, "Сұрақ тым ұзын"),
  history: z.array(chatMessageSchema).max(12).default([]),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
