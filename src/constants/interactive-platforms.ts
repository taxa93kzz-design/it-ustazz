import type { InteractivePlatform } from "@/types/interactive-resource";

export const INTERACTIVE_PLATFORMS: Record<InteractivePlatform, { name: string; home: string; search: string }> = {
  wordwall: { name: "Wordwall", home: "https://wordwall.net/", search: "https://wordwall.net/community" },
  learningapps: { name: "LearningApps", home: "https://learningapps.org/", search: "https://learningapps.org/index.php?overview&s=" },
  quizizz: { name: "Quizizz", home: "https://quizizz.com/", search: "https://quizizz.com/admin" },
  joyteka: { name: "Joyteka", home: "https://joyteka.com/ru/your-quiz", search: "https://joyteka.com/ru/your-quiz" },
  gimkit: { name: "Gimkit", home: "https://www.gimkit.com/", search: "https://www.gimkit.com/" },
};

export const ACTIVITY_TYPES = [
  "Викторина", "Сәйкестендіру", "Дұрыс/бұрыс", "Бос орынды толтыру",
  "Топтастыру", "Ретін анықтау", "Код нәтижесін анықтау", "Терминдерді сәйкестендіру",
  "Лабиринт", "Ойын", "Тест", "Қысқа жауап", "Командалық жарыс",
] as const;

export const ALLOWED_INTERACTIVE_HOSTS = [
  "wordwall.net", "learningapps.org", "quizizz.com", "wayground.com", "joyteka.com", "gimkit.com",
] as const;
