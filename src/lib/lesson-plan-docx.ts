import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  ImageRun,
  Footer,
  PageOrientation,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TableLayoutType,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { COLUMN_WIDTHS, INFO_TABLE_GRID, LESSON_PLAN_TITLE, LESSON_PROCESS_TITLE } from "@/constants/lesson-plan-template";
import type { LessonPlan, LessonPlanStage } from "@/types/lesson-plan";
import type { InteractiveResource } from "@/types/interactive-resource";

const borders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
};

const run = (text: string, bold = false, size = 22) =>
  new TextRun({ text, bold, size, font: "Times New Roman", color: "000000" });

const paragraph = (
  text: string,
  bold = false,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  size = 22,
) =>
  new Paragraph({
    alignment,
    spacing: { line: 240, before: 0, after: 0 },
    children: text.split("\n").flatMap((line, index) =>
      index ? [new TextRun({ break: 1 }), run(line, bold, size)] : [run(line, bold, size)],
    ),
  });

const cell = (
  text: string,
  width: number,
  bold = false,
  columnSpan?: number,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
) =>
  new TableCell({
    borders,
    columnSpan,
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [paragraph(text, bold, alignment, 24)],
  });

async function stageCell(
  stage: LessonPlanStage,
  key: "teacherActivity" | "studentActivity" | "assessment" | "resources",
  width: number,
  interactiveResources: InteractiveResource[] = [],
) {
  const text = stage[key];
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlPattern);
  const children: Paragraph[] = key === "resources" && parts.some((part) => /^https?:\/\//.test(part))
    ? [new Paragraph({
        spacing: { line: 240, before: 0, after: 0 },
        children: parts.map((part) =>
          /^https?:\/\//.test(part)
            ? new ExternalHyperlink({
                link: part,
                children: [new TextRun({ text: part, style: "Hyperlink", font: "Times New Roman", size: 20 })],
              })
            : run(part, false, 20),
        ),
      })]
    : [paragraph(text, false, AlignmentType.JUSTIFIED, 24)];
  if (key === "teacherActivity" && stage.image?.startsWith("data:image/")) {
    const [header, data] = stage.image.split(",");
    const type = header.includes("png") ? "png" : "jpg";
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: Uint8Array.from(atob(data), (c) => c.charCodeAt(0)), transformation: { width: 240, height: 150 }, type })],
      }),
    );
  }
  if (key === "resources") {
    for (const resource of interactiveResources.filter((item) => stage.interactiveResourceIds?.includes(item.id))) {
      children.push(new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          run(`${resource.platform}: ${resource.title}\n`, true, 18),
          new ExternalHyperlink({
            link: resource.url,
            children: [new TextRun({ text: resource.showFullUrl ? resource.url : "Тапсырманы ашу", style: "Hyperlink", font: "Times New Roman", size: 18 })],
          }),
        ],
      }));
      if (resource.includeQr && resource.qrDataUrl?.startsWith("data:image/png")) {
        const data = resource.qrDataUrl.split(",")[1];
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ data: Uint8Array.from(atob(data), (char) => char.charCodeAt(0)), transformation: { width: 72, height: 72 }, type: "png" })],
        }));
      }
    }
  }
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children,
  });
}

export async function createLessonPlanDocxBlob(plan: LessonPlan) {
  const infoRows = [
    new TableRow({ children: [cell("Бөлім:", INFO_TABLE_GRID[0], true), cell(plan.section, INFO_TABLE_GRID[1] + INFO_TABLE_GRID[2], true, 2)] }),
    new TableRow({ children: [cell("Педагогтің тегі, аты, әкесінің аты (болған жағдайда)", INFO_TABLE_GRID[0], true), cell(plan.teacher, INFO_TABLE_GRID[1] + INFO_TABLE_GRID[2], false, 2)] }),
    new TableRow({ children: [cell("Күні:", INFO_TABLE_GRID[0], true), cell(plan.date, INFO_TABLE_GRID[1] + INFO_TABLE_GRID[2], false, 2)] }),
    new TableRow({
      children: [
        cell(`Сынып: ${plan.grade}`, INFO_TABLE_GRID[0], true),
        cell(`Қатысушылар саны: ${plan.presentCount}`, INFO_TABLE_GRID[1], true),
        cell(`Қатыспағандар саны: ${plan.absentCount}`, INFO_TABLE_GRID[2], true),
      ],
    }),
    new TableRow({ children: [cell("Сабақтың тақырыбы", INFO_TABLE_GRID[0], true), cell(`${plan.topic} (${plan.lessonNumber} сабақ)`, INFO_TABLE_GRID[1] + INFO_TABLE_GRID[2], false, 2, AlignmentType.CENTER)] }),
    new TableRow({ children: [cell("Оқу бағдарламасына сәйкес оқыту мақсаттары", INFO_TABLE_GRID[0], true), cell(plan.learningGoal, INFO_TABLE_GRID[1] + INFO_TABLE_GRID[2], false, 2, AlignmentType.JUSTIFIED)] }),
    new TableRow({ children: [cell("Сабақтың мақсаты", INFO_TABLE_GRID[0], true), cell(plan.lessonGoal, INFO_TABLE_GRID[1] + INFO_TABLE_GRID[2], false, 2, AlignmentType.JUSTIFIED)] }),
  ];

  const stageRows: TableRow[] = [
    new TableRow({
      children: [
        cell("Сабақтың кезеңі/уақыт", COLUMN_WIDTHS[0], true),
        cell("Педагогтің әрекеті", COLUMN_WIDTHS[1], true),
        cell("Оқушының әрекеті", COLUMN_WIDTHS[2], true),
        cell("Бағалау", COLUMN_WIDTHS[3], true),
        cell("Ресурстар", COLUMN_WIDTHS[4], true),
      ],
    }),
  ];
  for (const stage of plan.stages) {
    stageRows.push(
      new TableRow({
        cantSplit: stage.stage === "Сабақтың соңы",
        children: [
          cell(`${stage.stage}\n${stage.minutes} минут`, COLUMN_WIDTHS[0], true),
          await stageCell(stage, "teacherActivity", COLUMN_WIDTHS[1]),
          await stageCell(stage, "studentActivity", COLUMN_WIDTHS[2]),
          await stageCell(stage, "assessment", COLUMN_WIDTHS[3]),
          await stageCell(stage, "resources", COLUMN_WIDTHS[4], plan.interactiveResources),
        ],
      }),
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Times New Roman", size: 24 }, paragraph: { spacing: { line: 240, before: 0, after: 0 } } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 567, right: 220, bottom: 700, left: 709, header: 0, footer: 317 },
          },
        },
        footers: {
          default: new Footer({ children: [paragraph("Informatica_didactics", false, AlignmentType.LEFT, 20)] }),
        },
        children: [
          paragraph(plan.school, false, AlignmentType.CENTER, 24),
          paragraph(`(${plan.school})`, false, AlignmentType.CENTER, 24),
          paragraph(LESSON_PLAN_TITLE, true, AlignmentType.CENTER, 24),
          paragraph(`${plan.topic} (${plan.lessonNumber} сабақ)`, true, AlignmentType.CENTER, 24),
          new Paragraph({ text: "" }),
          new Table({ width: { size: INFO_TABLE_GRID.reduce((sum, value) => sum + value, 0), type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [...INFO_TABLE_GRID], rows: infoRows }),
          new Paragraph({ text: "" }),
          paragraph(LESSON_PROCESS_TITLE, true, AlignmentType.CENTER, 24),
          new Paragraph({ text: "" }),
          new Table({ width: { size: COLUMN_WIDTHS.reduce((sum, value) => sum + value, 0), type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [...COLUMN_WIDTHS], rows: stageRows }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function exportLessonPlanDocx(plan: LessonPlan) {
  const blob = await createLessonPlanDocxBlob(plan);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safe = `ҚМЖ_${plan.grade}_${plan.topic}_${plan.date}`.replace(/[<>:"/\\|?*]/g, "-");
  link.href = url;
  link.download = `${safe}.docx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
