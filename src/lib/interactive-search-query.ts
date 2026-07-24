import type { InteractiveSearchInput, ResourceLanguage } from "@/types/interactive-resource";

const languageNames: Record<ResourceLanguage, string> = { kk: "қазақша", ru: "русский", en: "English" };

export function buildInteractiveSearchQueries(input: InteractiveSearchInput) {
  const languages: ResourceLanguage[] = input.language === "all" ? ["kk", "ru", "en"] : [input.language];
  const terms = [input.topic, input.grade, input.activityType, input.keywords].filter(Boolean).join(" ");
  return languages.map((language) => ({ language, query: `${terms} ${languageNames[language]}`.trim() }));
}
