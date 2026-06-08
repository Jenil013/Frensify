import { scoreToBand, type CefrLevel, type TefSkillId } from "../tefConstants";
import type { ExamPathway, TcfModuleId, TefModuleId } from "../types";

const OFFICIAL_MCQ_MAX: Record<
  ExamPathway,
  Record<"comprehension-ecrite" | "comprehension-orale", number>
> = {
  TCF: { "comprehension-ecrite": 39, "comprehension-orale": 39 },
  TEF: { "comprehension-ecrite": 40, "comprehension-orale": 40 },
};

export type McqComprehensionModuleId = "comprehension-ecrite" | "comprehension-orale";

export function isMcqComprehensionModule(
  moduleId: string
): moduleId is McqComprehensionModuleId {
  return moduleId === "comprehension-ecrite" || moduleId === "comprehension-orale";
}

export function getOfficialMcqMax(
  examType: ExamPathway,
  moduleId: McqComprehensionModuleId
): number {
  return OFFICIAL_MCQ_MAX[examType][moduleId];
}

/** Map +1/0 raw score to an estimated CEFR level using TEF Canada /699 bands. */
export function estimateMcqCefr(
  moduleId: McqComprehensionModuleId,
  rawScore: number,
  maxScore: number
): CefrLevel {
  if (maxScore <= 0) return "A1";
  const scaled = Math.round((rawScore / maxScore) * 699);
  const band = scoreToBand(moduleId as TefSkillId, scaled);
  return band?.cefr ?? "A1";
}

export function mcqScorePct(rawScore: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((rawScore / maxScore) * 100);
}
