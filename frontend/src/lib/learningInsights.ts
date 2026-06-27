import type { ModuleAccuracyEntry } from "./apiClient";
import {
  CEFR_LEVEL_ORDER,
  parseCefrTarget,
  type CefrLevel,
} from "../tefConstants";

export const DASHBOARD_MODULE_ORDER = [
  "comprehension-orale",
  "comprehension-ecrite",
  "expression-ecrite",
  "expression-orale",
] as const;

export type DashboardModuleId = (typeof DASHBOARD_MODULE_ORDER)[number];

export interface ModuleInsightRow {
  moduleId: DashboardModuleId;
  label: string;
  pct: number;
  cefr: CefrLevel;
  hasData: boolean;
}

export function cefrMeetsTarget(cefr: CefrLevel, target: CefrLevel): boolean {
  return CEFR_LEVEL_ORDER[cefr] >= CEFR_LEVEL_ORDER[target];
}

export function normalizeModuleRows(
  modules: Record<string, ModuleAccuracyEntry> | null,
  labels: Record<string, string>
): ModuleInsightRow[] {
  return DASHBOARD_MODULE_ORDER.map((moduleId) => {
    const accuracy = modules?.[moduleId];
    const hasData = accuracy?.hasData ?? false;
    return {
      moduleId,
      label: labels[moduleId] ?? moduleId,
      pct: hasData ? (accuracy?.accuracyPct ?? 0) : 0,
      cefr: (hasData ? (accuracy?.cefr ?? "A1") : "A1") as CefrLevel,
      hasData,
    };
  });
}

export function countModulesAtTarget(
  modules: Record<string, ModuleAccuracyEntry> | null,
  targetScore: string
): number {
  const target = parseCefrTarget(targetScore);
  return normalizeModuleRows(modules, {}).filter(
    (row) => row.hasData && cefrMeetsTarget(row.cefr, target)
  ).length;
}

export interface WeakestModuleInsight {
  moduleId: DashboardModuleId;
  label: string;
  pct: number;
  cefr: CefrLevel;
  hasData: boolean;
  belowTarget: boolean;
  insight: string;
}

function focusPracticeHint(moduleId: DashboardModuleId): string {
  switch (moduleId) {
    case "comprehension-orale":
      return "A timed listening module is your highest-impact practice today.";
    case "comprehension-ecrite":
      return "A timed reading module is your highest-impact practice today.";
    case "expression-ecrite":
      return "A structured writing module is your highest-impact practice today.";
    case "expression-orale":
      return "A timed oral module is your highest-impact practice today.";
  }
}

export function getWeakestModule(
  modules: Record<string, ModuleAccuracyEntry> | null,
  labels: Record<string, string>,
  targetScore: string
): WeakestModuleInsight {
  const target = parseCefrTarget(targetScore);
  const rows = normalizeModuleRows(modules, labels);
  const withData = rows.filter((row) => row.hasData);

  let focus: ModuleInsightRow;

  if (withData.length === 0) {
    focus = {
      moduleId: "comprehension-orale",
      label: labels["comprehension-orale"] ?? "Compréhension orale",
      pct: 0,
      cefr: "A1",
      hasData: false,
    };
  } else {
    focus = withData.reduce((weakest, row) => {
      const rowLevel = CEFR_LEVEL_ORDER[row.cefr];
      const weakestLevel = CEFR_LEVEL_ORDER[weakest.cefr];
      if (rowLevel < weakestLevel) return row;
      if (rowLevel > weakestLevel) return weakest;
      return row.pct < weakest.pct ? row : weakest;
    });
  }

  const belowTarget = !cefrMeetsTarget(focus.cefr, target);

  let insight: string;
  if (!focus.hasData) {
    insight =
      "No module attempts yet. Start with Compréhension orale to establish your baseline.";
  } else if (belowTarget) {
    insight = `${focus.label} is at ${focus.cefr}, your target is ${target}. ${focusPracticeHint(focus.moduleId)}`;
  } else {
    insight = `${focus.label} is at ${focus.cefr}, meeting your ${target} target. Keep building consistency with another timed session.`;
  }

  return {
    ...focus,
    belowTarget,
    insight,
  };
}
