import { INTERACTIVE_PLATFORMS } from "@/constants/interactive-platforms";
import type { InteractivePlatform, InteractiveResource, InteractiveSearchInput, ResourceLanguage } from "@/types/interactive-resource";

export function mapSearchPage(platform: InteractivePlatform, input: InteractiveSearchInput, language: ResourceLanguage): InteractiveResource {
  const config = INTERACTIVE_PLATFORMS[platform];
  const query = encodeURIComponent([input.topic, input.grade, input.keywords].filter(Boolean).join(" "));
  const url = platform === "wordwall" ? `${config.search}?q=${query}` :
    platform === "learningapps" ? `${config.search}${query}&category=0&tool=` : config.search;
  return {
    id: crypto.randomUUID(), platform, title: `${config.name} платформасында іздеу`,
    description: "Бұл дайын тапсырма емес. Сілтеме платформаның іздеу немесе кітапхана бетін ашады.",
    url, grade: input.grade, subject: "Информатика", topic: input.topic, language,
    activityType: input.activityType, lessonStage: input.lessonStage, durationMinutes: input.durationMinutes,
    descriptors: ["тапсырма нұсқаулығын оқиды", "интерактивті әрекетті орындайды", "нәтижесін тексереді"],
    source: "search", verifiedByTeacher: false, createdAt: new Date().toISOString(),
  };
}

export function createGeneratedIdea(input: InteractiveSearchInput, platform: InteractivePlatform): InteractiveResource {
  const name = INTERACTIVE_PLATFORMS[platform].name;
  return {
    ...mapSearchPage(platform, input, input.language === "all" ? "kk" : input.language),
    id: crypto.randomUUID(),
    title: `${input.topic}: ${input.activityType}`,
    description: `${name} ішінде ${input.durationMinutes} минуттық тапсырма жасаңыз: 6–8 сұрақ, бірден кері байланыс және қорытынды нәтиже. Бұл — жарияланбаған идея.`,
    url: INTERACTIVE_PLATFORMS[platform].home,
    source: "generated-idea",
  };
}
