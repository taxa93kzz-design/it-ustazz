import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import type { LessonStage, Material, TaskItem, TestQuestion } from "@/types/material";
import type { LessonPlan } from "@/types/lesson-plan";
import { exportLessonPlanDocx } from "@/lib/lesson-plan-docx";

const cell = (text: string, bold = false) =>
  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold, font: "Times New Roman" })] })] });

export async function exportMaterial(material: Material) {
  if (material.type === "ҚМЖ" && "lessonNumber" in material.content) {
    const content = material.content;
    const plan: LessonPlan = {
      ...(content as unknown as Omit<LessonPlan, "stages">),
      stages: (content.stages as Array<LessonStage & { image?: string }>).map((stage, index) => ({
        id: `${index}-${stage.stage}`,
        stage: stage.stage as LessonPlan["stages"][number]["stage"],
        minutes: Number.parseInt(stage.time, 10),
        teacherActivity: stage.teacher,
        studentActivity: stage.student,
        assessment: stage.assessment,
        resources: stage.resources,
        image: stage.image,
      })),
    };
    return exportLessonPlanDocx(plan);
  }

  const content = material.content;
  const children: (Paragraph | Table)[] = [
    new Paragraph({ text: material.title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `${material.type} · ${material.grade}-сынып` }),
    new Paragraph({ text: "" }),
  ];

  if (material.type === "ҚМЖ") {
    const fields = [
      ["Білім беру ұйымы", content.school],
      ["Педагог", content.teacher],
      ["Бөлім", content.section],
      ["Сабақ тақырыбы", content.topic],
      ["Оқу мақсаты", content.learningGoal],
      ["Сабақ мақсаты", content.lessonGoal],
    ];
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: fields.map(([label, value]) => new TableRow({ children: [cell(String(label), true), cell(String(value ?? ""))] })),
    }));
    const stages = content.stages as LessonStage[];
    children.push(
      new Paragraph({ text: "" }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: ["Кезең/уақыт", "Педагог әрекеті", "Оқушы әрекеті", "Бағалау", "Ресурстар"].map((value) => cell(value, true)) }),
          ...stages.map((stage) => new TableRow({ children: [stage.stage + "\n" + stage.time, stage.teacher, stage.student, stage.assessment, stage.resources].map((value) => cell(value)) })),
        ],
      }),
    );
  } else if (material.type === "Тапсырма") {
    (content.items as TaskItem[]).forEach((item, index) => {
      children.push(
        new Paragraph({ text: `${index + 1}-тапсырма. ${item.text}`, heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: `Бағалау критерийі: ${item.criteria}` }),
        new Paragraph({ text: `Дескриптор: ${item.descriptor}` }),
        new Paragraph({ text: `Жауабы: ${item.answer}` }),
      );
    });
  } else if (material.type === "Тест") {
    (content.questions as TestQuestion[]).forEach((question, index) => {
      children.push(
        new Paragraph({ text: `${index + 1}. ${question.question}`, heading: HeadingLevel.HEADING_2 }),
        ...question.options.map((option) => new Paragraph({ text: option })),
      );
    });
    children.push(new Paragraph({ text: "Жауаптар кілті", heading: HeadingLevel.HEADING_1 }));
    (content.questions as TestQuestion[]).forEach((question, index) => children.push(new Paragraph({ text: `${index + 1}. ${question.answer}` })));
  } else {
    ["theory", "terms", "levelA", "levelB", "levelC", "selfAssessment", "reflection"].forEach((key) =>
      children.push(new Paragraph({ text: String(content[key] ?? "") })),
    );
  }

  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${material.title.replace(/[<>:"/\\|?*]/g, "-")}.docx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
