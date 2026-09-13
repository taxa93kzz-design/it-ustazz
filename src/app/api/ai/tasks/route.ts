import { NextResponse } from "next/server";
import { aiTaskInputSchema, aiTaskOutputSchema } from "@/lib/ai-schemas";
import { aiApiError } from "@/lib/server/api-error";
import { generateStructured } from "@/lib/server/gemini";
import { getCurrentProfile } from "@/lib/auth";
import { claimAiGeneration, refundAiGeneration, subscriptionRequiredResponse } from "@/lib/subscription";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile?.is_active) return NextResponse.json({ error: "Сессия мерзімі аяқталған" }, { status: 401 });
  let claim: Awaited<ReturnType<typeof claimAiGeneration>> | null = null;
  try {
    const input = aiTaskInputSchema.parse(await request.json());
    claim = await claimAiGeneration();
    if (!claim.allowed) return NextResponse.json(subscriptionRequiredResponse(), { status: 402 });
    const result = await generateStructured(
      `Қазақ тілінде ${input.grade}-сынып информатикасына ${input.count} тапсырма жаса.
Тақырып: ${input.topic}. Оқу мақсаты: ${input.learningGoal}.
Түрі: ${input.type}. Деңгейі: ${input.level}.
Әр тапсырма нақты, жас ерекшелігіне сай болсын және бағалау критерийі, 2-4 әрекеттік дескриптор, толық жауап не үлгі шешім берілсін.
Тек JSON қайтар: {"items":[{"text":"...","criteria":"...","descriptor":"...","answer":"..."}]}`,
      aiTaskOutputSchema,
    );
    return NextResponse.json(result, { headers: { "X-AI-Remaining": String(claim.remaining) } });
  } catch (error) {
    try { await refundAiGeneration(profile.id, Boolean(claim?.charged)); } catch { /* Негізгі қатені сақтаймыз. */ }
    return aiApiError(error);
  }
}
