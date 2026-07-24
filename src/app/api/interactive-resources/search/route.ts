import { NextResponse } from "next/server";
import { INTERACTIVE_PLATFORMS } from "@/constants/interactive-platforms";
import { buildInteractiveSearchQueries } from "@/lib/interactive-search-query";
import { mapSearchPage } from "@/lib/interactive-resource-mapper";
import { interactiveSearchSchema } from "@/lib/interactive-resource-validator";
import type { InteractivePlatform } from "@/types/interactive-resource";
import { hasActiveSession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!await hasActiveSession()) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  try {
    const parsed = interactiveSearchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Енгізілген деректер қате" }, { status: 400 });
    }
    const input = parsed.data;
    const platforms = (input.platform === "all" ? Object.keys(INTERACTIVE_PLATFORMS) : [input.platform]) as InteractivePlatform[];
    const queries = buildInteractiveSearchQueries(input);
    const resources = platforms.flatMap((platform) => queries.slice(0, 1).map(({ language }) => mapSearchPage(platform, input, language)));
    return NextResponse.json({
      resources,
      message: "Қауіпсіздік үшін тек ресми іздеу беттері берілді. Дайын тапсырманы мұғалім өзі таңдап, сілтемесін тексереді.",
    });
  } catch {
    return NextResponse.json({ resources: [], message: "Іздеу қызметі уақытша қолжетімсіз. Сілтемені қолмен қосуға болады." }, { status: 503 });
  }
}
