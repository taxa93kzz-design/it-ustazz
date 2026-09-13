import { NextResponse } from "next/server";
import { aiLessonInputSchema, aiLessonOutputSchema } from "@/lib/ai-schemas";
import { aiApiError } from "@/lib/server/api-error";
import { generateStructured } from "@/lib/server/gemini";
import { getCurrentProfile } from "@/lib/auth";
import { claimAiGeneration, refundAiGeneration, subscriptionRequiredResponse } from "@/lib/subscription";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile?.is_active) return NextResponse.json({ error: "Сессия мерзімі аяқталған" }, { status: 401 });
  let claim: Awaited<ReturnType<typeof claimAiGeneration>> | null = null;
  try {
    const input = aiLessonInputSchema.parse(await request.json());
    claim = await claimAiGeneration();
    if (!claim.allowed) return NextResponse.json(subscriptionRequiredResponse(), { status: 402 });
    const result = await generateStructured(
      `Сен Қазақстандағы информатика мұғаліміне көмектесетін әдіскерсің.
Тек қазақ тілінде JSON қайтар. ${input.grade}-сыныпқа арналған «${input.topic}» сабағын құрастыр.
Оқу мақсаты: ${input.learningGoal}
Сабақ мақсаты: ${input.lessonGoal}
Үй тапсырмасы: ${input.homework}
Рефлексия: ${input.reflectionMethod}
ЕБҚ қолдауы: ${input.specialNeeds || "қажет емес"}
Дәл үш кезең бер: Сабақтың басы, Сабақтың ортасы, Сабақтың соңы.
Әр кезеңде тақырыпқа сай нақты педагог әрекеті, оған логикалық сәйкес оқушы әрекеті, бағалау және ресурстар болсын.
Практикалық тапсырмаға 2-4 әрекеттік дескрипторды педагог әрекетіне енгіз.
JSON пішімі: {"stages":[{"stage":"...","teacherActivity":"...","studentActivity":"...","assessment":"...","resources":"..."}]}`,
      aiLessonOutputSchema,
    );
    return NextResponse.json(result, { headers: { "X-AI-Remaining": String(claim.remaining) } });
  } catch (error) {
    try { await refundAiGeneration(profile.id, Boolean(claim?.charged)); } catch { /* Негізгі қатені сақтаймыз. */ }
    return aiApiError(error);
  }
}
