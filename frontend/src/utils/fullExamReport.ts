import { TCF_MODULE_REGISTRY, TCF_MODULE_ORDER } from "../tcfConstants";
import { TEF_MODULE_REGISTRY, TEF_MODULE_ORDER } from "../tefConstants";
import type {
  ExamPathway,
  FullExamReport,
  FullExamReportModule,
  McqModuleResult,
  OralModuleResult,
  SkillType,
  TcfModuleCompletionResult,
  TcfModuleId,
  TefModuleCompletionResult,
  TefModuleId,
  WritingModuleResult,
} from "../types";
import {
  estimateMcqCefr,
  getOfficialMcqMax,
  mcqScorePct,
  type McqComprehensionModuleId,
} from "./mcqScoring";

const SKILL_BY_MODULE: Record<string, SkillType> = {
  "comprehension-orale": "listening",
  "comprehension-ecrite": "reading",
  "expression-ecrite": "writing",
  "expression-orale": "speaking",
};

function sectionLabelsFor(
  examType: ExamPathway,
  moduleId: string
): string[] {
  const registry =
    examType === "TCF"
      ? TCF_MODULE_REGISTRY[moduleId as TcfModuleId]
      : TEF_MODULE_REGISTRY[moduleId as TefModuleId];
  return (
    registry?.meta.sections?.map((s) => s.label.split(":")[0].trim()) ?? []
  );
}

function buildMcqModule(
  examType: ExamPathway,
  moduleId: string,
  label: string,
  mcq: McqModuleResult
): FullExamReportModule {
  const officialMax = getOfficialMcqMax(
    examType,
    moduleId as McqComprehensionModuleId
  );
  const cefr = estimateMcqCefr(
    moduleId as McqComprehensionModuleId,
    mcq.rawScore,
    mcq.maxScore
  );
  return {
    moduleId,
    moduleLabel: label,
    skill: SKILL_BY_MODULE[moduleId] ?? "reading",
    type: "mcq",
    rawScore: mcq.rawScore,
    maxScore: officialMax,
    scorePct: mcqScorePct(mcq.rawScore, mcq.maxScore),
    cefrEstimate: cefr,
  };
}

function buildWritingModule(
  examType: ExamPathway,
  moduleId: string,
  label: string,
  writing: WritingModuleResult
): FullExamReportModule {
  return {
    moduleId,
    moduleLabel: label,
    skill: "writing",
    type: "writing",
    sectionLabels: sectionLabelsFor(examType, moduleId),
    writingSections: writing.sections,
  };
}

function buildOralModule(
  examType: ExamPathway,
  moduleId: string,
  label: string,
  oral: OralModuleResult
): FullExamReportModule {
  const levels = oral.sections
    .map((s) => s.feedback?.cefrLevel)
    .filter(Boolean) as string[];
  const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const cefrEstimate =
    levels.length > 0
      ? levels.reduce((min, l) =>
          order.indexOf(l) < order.indexOf(min) ? l : min
        )
      : undefined;

  return {
    moduleId,
    moduleLabel: label,
    skill: "speaking",
    type: "oral",
    cefrEstimate,
    sectionLabels: sectionLabelsFor(examType, moduleId),
    oralSections: oral.sections,
  };
}

function aggregateComprehensionPct(modules: FullExamReportModule[]): number {
  const mcq = modules.filter((m) => m.type === "mcq" && m.maxScore != null);
  if (mcq.length === 0) return 0;
  const totalRaw = mcq.reduce((a, m) => a + (m.rawScore ?? 0), 0);
  const totalMax = mcq.reduce((a, m) => a + (m.maxScore ?? 0), 0);
  return totalMax > 0 ? Math.round((totalRaw / totalMax) * 100) : 0;
}

function estimateOverallCefr(pct: number): string {
  if (pct >= 85) return "C1";
  if (pct >= 70) return "B2";
  if (pct >= 50) return "B1";
  return "A2";
}

function buildFromTcfResults(
  examId: string,
  examName: string,
  date: string,
  results: Partial<Record<TcfModuleId, TcfModuleCompletionResult>>
): FullExamReport {
  const modules: FullExamReportModule[] = TCF_MODULE_ORDER.map((moduleId) => {
    const label = TCF_MODULE_REGISTRY[moduleId].meta.labelFr;
    const r = results[moduleId];
    if (!r) {
      return {
        moduleId,
        moduleLabel: label,
        skill: SKILL_BY_MODULE[moduleId],
        type: "mcq",
      };
    }
    if (r.type === "mcq") {
      return buildMcqModule("TCF", moduleId, label, r.result);
    }
    if (r.type === "writing") {
      return buildWritingModule("TCF", moduleId, label, r.result);
    }
    return buildOralModule("TCF", moduleId, label, r.result);
  });

  const comprehensionAggregatePct = aggregateComprehensionPct(modules);
  return {
    examType: "TCF",
    examId,
    examName,
    date,
    comprehensionAggregatePct,
    estimatedCefr: estimateOverallCefr(comprehensionAggregatePct),
    modules,
  };
}

function buildFromTefResults(
  examId: string,
  examName: string,
  date: string,
  results: Partial<Record<TefModuleId, TefModuleCompletionResult>>
): FullExamReport {
  const modules: FullExamReportModule[] = TEF_MODULE_ORDER.map((moduleId) => {
    const label = TEF_MODULE_REGISTRY[moduleId].meta.labelFr;
    const r = results[moduleId];
    if (!r) {
      return {
        moduleId,
        moduleLabel: label,
        skill: SKILL_BY_MODULE[moduleId],
        type: "mcq",
      };
    }
    if (r.type === "mcq") {
      return buildMcqModule(
        "TEF",
        moduleId,
        label,
        r.result as McqModuleResult
      );
    }
    if (r.type === "writing") {
      return buildWritingModule(
        "TEF",
        moduleId,
        label,
        r.result as WritingModuleResult
      );
    }
    return buildOralModule(
      "TEF",
      moduleId,
      label,
      r.result as OralModuleResult
    );
  });

  const comprehensionAggregatePct = aggregateComprehensionPct(modules);
  return {
    examType: "TEF",
    examId,
    examName,
    date,
    comprehensionAggregatePct,
    estimatedCefr: estimateOverallCefr(comprehensionAggregatePct),
    modules,
  };
}

export function buildFullExamReport(
  examType: ExamPathway,
  examId: string,
  examName: string,
  results:
    | Partial<Record<TcfModuleId, TcfModuleCompletionResult>>
    | Partial<Record<TefModuleId, TefModuleCompletionResult>>
): FullExamReport {
  const date = new Date().toISOString().split("T")[0];
  if (examType === "TEF") {
    return buildFromTefResults(
      examId,
      examName,
      date,
      results as Partial<Record<TefModuleId, TefModuleCompletionResult>>
    );
  }
  return buildFromTcfResults(
    examId,
    examName,
    date,
    results as Partial<Record<TcfModuleId, TcfModuleCompletionResult>>
  );
}
