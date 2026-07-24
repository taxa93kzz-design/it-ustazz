import { NextResponse } from "next/server";
import { aiLessonInputSchema, aiLessonOutputSchema } from "@/lib/ai-schemas";
import { aiApiError } from "@/lib/server/api-error";
import { generateStructured } from "@/lib/server/gemini";
import { hasActiveSession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!await hasActiveSession()) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  try {
    const input = aiLessonInputSchema.parse(await request.json());
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
    return NextResponse.json(result);
  } catch (error) {
    return aiApiError(error);
  }
}
