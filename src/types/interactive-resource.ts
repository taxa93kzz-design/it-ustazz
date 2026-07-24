export type InteractivePlatform = "wordwall" | "learningapps" | "quizizz" | "joyteka" | "gimkit";
export type ResourceLanguage = "kk" | "ru" | "en";
export type LessonStageKey = "start" | "middle" | "end";
export type InteractiveResourceSource = "search" | "manual" | "generated-idea";

export interface InteractiveResource {
  id: string;
  platform: InteractivePlatform;
  title: string;
  description?: string;
  url: string;
  grade?: string;
  subject: "Информатика";
  topic: string;
  language: ResourceLanguage;
  activityType: string;
  lessonStage: LessonStageKey;
  durationMinutes?: number;
  descriptors: string[];
  source: InteractiveResourceSource;
  verifiedByTeacher: boolean;
  createdAt: string;
  qrDataUrl?: string;
  includeQr?: boolean;
  showFullUrl?: boolean;
}

export interface InteractiveSearchInput {
  topic: string;
  grade: string;
  learningGoal: string;
  purpose: string;
  lessonStage: LessonStageKey;
  platform: InteractivePlatform | "all";
  activityType: string;
  language: ResourceLanguage | "all";
  durationMinutes: number;
  keywords?: string;
}
