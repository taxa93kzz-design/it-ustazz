import type { InteractiveResource } from "@/types/interactive-resource";

export interface LessonPlanStage {
  id: string;
  stage: "Сабақтың басы" | "Сабақтың ортасы" | "Сабақтың соңы";
  minutes: number;
  teacherActivity: string;
  studentActivity: string;
  assessment: string;
  resources: string;
  image?: string;
  interactiveResourceIds?: string[];
}

export interface LessonPlan {
  school: string;
  teacher: string;
  date: string;
  grade: string;
  presentCount: number;
  absentCount: number;
  section: string;
  topic: string;
  lessonNumber: number;
  learningGoal: string;
  lessonGoal: string;
  duration: number;
  specialNeeds: string;
  assessmentMethods: string;
  reflectionMethod: string;
  homework: string;
  resources: string;
  stages: LessonPlanStage[];
  interactiveResources: InteractiveResource[];
}

export type LessonPlanFormValues = Omit<LessonPlan, "stages" | "interactiveResources"> & {
  startMinutes: number;
  middleMinutes: number;
  endMinutes: number;
};
