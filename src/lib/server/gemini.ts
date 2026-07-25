import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export class GeminiConfigurationError extends Error {}
export class GeminiGenerationError extends Error {}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigurationError("Gemini API кілті серверде бапталмаған");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateStructured<T>(
  prompt: string,
  schema: z.ZodType<T>,
): Promise<T> {
  try {
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.45,
      },
    });
    if (!response.text) throw new GeminiGenerationError("AI бос жауап қайтарды");
    return schema.parse(JSON.parse(response.text));
  } catch (error) {
    if (error instanceof GeminiConfigurationError || error instanceof GeminiGenerationError) throw error;
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      throw new GeminiGenerationError("AI жауабының құрылымы жарамсыз");
    }
    throw new GeminiGenerationError("Gemini қызметіне сұрау жіберу сәтсіз аяқталды");
  }
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.35,
        maxOutputTokens: 900,
      },
    });
    const text = response.text?.trim();
    if (!text) throw new GeminiGenerationError("AI бос жауап қайтарды");
    return text;
  } catch (error) {
    if (error instanceof GeminiConfigurationError || error instanceof GeminiGenerationError) throw error;
    throw new GeminiGenerationError("Gemini қызметіне сұрау жіберу сәтсіз аяқталды");
  }
}
