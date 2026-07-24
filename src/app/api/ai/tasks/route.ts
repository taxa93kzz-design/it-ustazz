import { NextResponse } from "next/server";
import { aiTaskInputSchema, aiTaskOutputSchema } from "@/lib/ai-schemas";
import { aiApiError } from "@/lib/server/api-error";
import { generateStructured } from "@/lib/server/gemini";
import { hasActiveSession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!await hasActiveSession()) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  try {
    const input = aiTaskInputSchema.parse(await request.json());
    const result = await generateStructured(
      `Қазақ тілінде ${input.grade}-сынып информатикасына ${input.count} тапсырма жаса.
Тақырып: ${input.topic}. Оқу мақсаты: ${input.learningGoal}.
Түрі: ${input.type}. Деңгейі: ${input.level}.
Әр тапсырма нақты, жас ерекшелігіне сай болсын және бағалау критерийі, 2-4 әрекеттік дескриптор, толық жауап не үлгі шешім берілсін.
Тек JSON қайтар: {"items":[{"text":"...","criteria":"...","descriptor":"...","answer":"..."}]}`,
      aiTaskOutputSchema,
    );
    return NextResponse.json(result);
  } catch (error) {
    return aiApiError(error);
  }
}
