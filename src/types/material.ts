export type MaterialType = "ҚМЖ" | "Тапсырма" | "Тест" | "Жұмыс парағы";

export interface Material {
  id: string;
  type: MaterialType;
  title: string;
  grade: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
  content: Record<string, unknown>;
}

export interface LessonStage {
  stage: string;
  time: string;
  teacher: string;
  student: string;
  assessment: string;
  resources: string;
}

export interface TaskItem {
  text: string;
  criteria: string;
  descriptor: string;
  answer: string;
}

export interface TestQuestion {
  question: string;
  options: string[];
  answer: string;
}
