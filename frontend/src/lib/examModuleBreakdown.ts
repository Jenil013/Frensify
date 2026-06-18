import { TEF_MODULE_REGISTRY } from "../tefConstants";
import { TCF_MODULE_REGISTRY } from "../tcfConstants";
import type { TefModuleId } from "../types";

const DISPLAY_ORDER: TefModuleId[] = [
  "comprehension-orale",
  "comprehension-ecrite",
  "expression-ecrite",
  "expression-orale",
];

const MODULE_CARD_TITLES: Record<TefModuleId, { line1: string; line2: string }> =
  {
    "comprehension-orale": { line1: "Listening", line2: "Comprehension" },
    "comprehension-ecrite": { line1: "Reading", line2: "Comprehension" },
    "expression-orale": { line1: "Speaking", line2: "Expression" },
    "expression-ecrite": { line1: "Writing", line2: "Expression" },
  };

export interface ExamModuleCard {
  part: number;
  moduleId: TefModuleId;
  line1: string;
  line2: string;
  detail: string;
}

/** @deprecated Use ExamModuleCard via getExamModuleCards */
export interface ExamModuleRow {
  label: string;
  detail: string;
}

function formatSectionTaskLabel(sections: { id: string }[]): string {
  if (
    sections.length === 2 &&
    sections.every((s) => s.id === "A" || s.id === "B")
  ) {
    return "Task: 2 (Section A & B)";
  }
  if (sections.every((s) => /^[0-9]+$/.test(s.id))) {
    const nums = sections.map((s) => s.id).join(", ");
    return `Task: ${sections.length} (Tâche ${nums})`;
  }
  return `Task: ${sections.length}`;
}

function formatModuleDetail(
  meta: (typeof TEF_MODULE_REGISTRY)[TefModuleId]["meta"]
): string {
  if (meta.format === "mcq" && meta.questionCount != null) {
    return `Question: ${meta.questionCount} MCQs / Duration: ${meta.durationMinutes} mins`;
  }

  const sections = meta.sections ?? [];
  const taskPart = formatSectionTaskLabel(sections);
  const breakdown = sections.map((s) => s.durationMinutes).join(" + ");
  return `${taskPart} / Duration: ${meta.durationMinutes} (${breakdown}) mins`;
}

export function getExamModuleCards(examType: "TEF" | "TCF"): ExamModuleCard[] {
  const registry =
    examType === "TEF" ? TEF_MODULE_REGISTRY : TCF_MODULE_REGISTRY;

  return DISPLAY_ORDER.map((id, index) => {
    const meta = registry[id].meta;
    const titles = MODULE_CARD_TITLES[id];
    return {
      part: index + 1,
      moduleId: id,
      line1: titles.line1,
      line2: titles.line2,
      detail: formatModuleDetail(meta),
    };
  });
}

export function getExamModuleBreakdown(
  examType: "TEF" | "TCF"
): ExamModuleRow[] {
  return getExamModuleCards(examType).map((card) => ({
    label: `${card.line1} ${card.line2}`,
    detail: card.detail,
  }));
}

export function getExamTotalDurationMinutes(examType: "TEF" | "TCF"): number {
  const registry =
    examType === "TEF" ? TEF_MODULE_REGISTRY : TCF_MODULE_REGISTRY;
  return DISPLAY_ORDER.reduce(
    (sum, id) => sum + registry[id].meta.durationMinutes,
    0
  );
}
