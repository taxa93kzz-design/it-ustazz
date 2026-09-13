import { NextResponse } from "next/server";
import { aiTestInputSchema, aiTestOutputSchema } from "@/lib/ai-schemas";
import { aiApiError } from "@/lib/server/api-error";
import { generateStructured } from "@/lib/server/gemini";
import { getCurrentProfile } from "@/lib/auth";
import { claimAiGeneration, refundAiGeneration, subscriptionRequiredResponse } from "@/lib/subscription";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile?.is_active) return NextResponse.json({ error: "Сессия мерзімі аяқталған" }, { status: 401 });
  let claim: Awaited<ReturnType<typeof claimAiGeneration>> | null = null;
  try {
    const input = aiTestInputSchema.parse(await request.json());
    claim = await claimAiGeneration();
    if (!claim.allowed) return NextResponse.json(subscriptionRequiredResponse(), { status: 402 });
    const result = await generateStructured(
      `Қазақ тілінде ${input.grade}-сынып информатикасына ${input.count} тест сұрағын жаса.
Тақырып: ${input.topic}. Оқу мақсаты: ${input.learningGoal}.
Қиындық: ${input.difficulty}. Сұрақ түрі: ${input.type}.
Жауап нұсқаларының басына A), B), C), D) белгісін қой. answer өрісінде дұрыс әріпті не бірнеше әріпті үтірмен бер.
Тек JSON қайтар: {"questions":[{"question":"...","options":["A) ...","B) ..."],"answer":"A"}]}`,
      aiTestOutputSchema,
    );
    return NextResponse.json(result, { headers: { "X-AI-Remaining": String(claim.remaining) } });
  } catch (error) {
    try { await refundAiGeneration(profile.id, Boolean(claim?.charged)); } catch { /* Негізгі қатені сақтаймыз. */ }
    return aiApiError(error);
  }
}
