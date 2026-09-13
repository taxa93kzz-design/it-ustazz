import { AlignmentType, Document, HeadingLevel, Packer, PageOrientation, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from "docx";
import type { LessonStage, Material, TaskItem, TestQuestion } from "@/types/material";
import type { LessonPlan } from "@/types/lesson-plan";
import { exportLessonPlanDocx } from "@/lib/lesson-plan-docx";

const cell = (text: string, bold = false) =>
  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold, font: "Times New Roman" })] })] });

const worksheetParagraphs = (text: string) => text.split("\n").map((line) => new Paragraph({
  spacing: { after: line ? 60 : 100 },
  children: [new TextRun({ text: line || " ", font: "Arial", size: 16, bold: /^(Мақсаты:|Дескриптор:|БАРЛЫҒЫ:)/.test(line) })],
}));

async function exportWorksheet(material: Material) {
  const content = material.content;
  const levelCells = [
    ["A ДЕҢГЕЙІ — БІЛУ ЖӘНЕ ТҮСІНУ", "levelA", "D1FAE5", "047857", "3 БАЛЛ"],
    ["B ДЕҢГЕЙІ — ҚОЛДАНУ", "levelB", "DBEAFE", "1D4ED8", "3 БАЛЛ"],
    ["C ДЕҢГЕЙІ — ТАЛДАУ ЖӘНЕ БАҒАЛАУ", "levelC", "EDE9FE", "7C3AED", "4 БАЛЛ"],
  ];
  const children: (Paragraph | Table)[] = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "ABC ДЕҢГЕЙЛІК ЖҰМЫС", bold: true, size: 30, color: "1D4ED8", font: "Arial" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 70 }, children: [new TextRun({ text: `${material.grade}-сынып · Тақырыбы: ${String(content.topic)}`, bold: true, size: 20, font: "Arial" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: String(content.instruction), italics: true, size: 17, font: "Arial" })] }),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: `Оқу мақсаты: ${String(content.learningGoal)}`, bold: true, size: 17, font: "Arial" })] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [3400, 3400, 3400],
      rows: [
        new TableRow({ tableHeader: true, children: levelCells.map(([title, , , color, score]) => new TableCell({ shading: { fill: color }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${title}  •  ${score}`, bold: true, color: "FFFFFF", size: 18, font: "Arial" })] })] })) }),
        new TableRow({ children: levelCells.map(([, key, fill]) => new TableCell({ shading: { fill }, verticalAlign: VerticalAlign.TOP, margins: { top: 120, bottom: 120, left: 140, right: 140 }, children: worksheetParagraphs(String(content[key])) })) }),
      ],
    }),
    new Paragraph({ spacing: { before: 120 }, shading: { fill: "FEF3C7" }, children: [new TextRun({ text: `Есіңізде болсын! ${String(content.reminder)}`, bold: true, size: 16, font: "Arial" }), new TextRun({ text: "     ЖАЛПЫ: 10 БАЛЛ", bold: true, color: "B45309", size: 18, font: "Arial" })] }),
  ];
  const document = new Document({ sections: [{
    properties: { page: { size: { orientation: PageOrientation.LANDSCAPE }, margin: { top: 500, right: 500, bottom: 500, left: 500 } } },
    children,
  }] });
  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const link = createDownloadLink();
  link.href = url;
  link.download = `${material.title.replace(/[<>:"/\\|?*]/g, "-")}.docx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const createDownloadLink = () => window.document.createElement("a");

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
  if (material.type === "Жұмыс парағы" && "levelA" in material.content) return exportWorksheet(material);

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
