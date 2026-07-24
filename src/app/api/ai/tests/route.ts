import { NextResponse } from "next/server";
import { aiTestInputSchema, aiTestOutputSchema } from "@/lib/ai-schemas";
import { aiApiError } from "@/lib/server/api-error";
import { generateStructured } from "@/lib/server/gemini";
import { hasActiveSession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!await hasActiveSession()) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  try {
    const input = aiTestInputSchema.parse(await request.json());
    const result = await generateStructured(
      `Қазақ тілінде ${input.grade}-сынып информатикасына ${input.count} тест сұрағын жаса.
Тақырып: ${input.topic}. Оқу мақсаты: ${input.learningGoal}.
Қиындық: ${input.difficulty}. Сұрақ түрі: ${input.type}.
Жауап нұсқаларының басына A), B), C), D) белгісін қой. answer өрісінде дұрыс әріпті не бірнеше әріпті үтірмен бер.
Тек JSON қайтар: {"questions":[{"question":"...","options":["A) ...","B) ..."],"answer":"A"}]}`,
      aiTestOutputSchema,
    );
    return NextResponse.json(result);
  } catch (error) {
    return aiApiError(error);
  }
}
