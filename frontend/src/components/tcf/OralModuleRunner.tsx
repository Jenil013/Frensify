import React from "react";
import OralSimulationRunner from "../OralSimulationRunner";
import {
  ExamPathway,
  OralModuleResult,
  TcfModuleDefinition,
} from "../../types";

interface OralModuleRunnerProps {
  module: TcfModuleDefinition;
  examType: ExamPathway;
  onComplete: (result: OralModuleResult) => void;
  onAbort?: () => void;
  examMode?: boolean;
}

const TASK_IDS = ["1", "2", "3"] as const;

export default function OralModuleRunner({
  module,
  examType,
  onComplete,
  onAbort,
  examMode = true,
}: OralModuleRunnerProps) {
  const sectionsMeta = module.meta.sections!;
  const sectionContent = module.sections!;

  return (
    <OralSimulationRunner
      title={module.meta.labelFr}
      objective={module.meta.objective}
      durationMinutes={module.meta.durationMinutes}
      sectionMetas={sectionsMeta.map((s) => ({
        id: s.id,
        label: s.label,
        durationMinutes: s.durationMinutes,
      }))}
      sectionIds={[...TASK_IDS]}
      sectionContent={sectionContent}
      examType={examType}
      exerciseId={module.combinationId ?? "tcf-expression-orale-default"}
      onComplete={onComplete}
      onAbort={onAbort}
      examMode={examMode}
    />
  );
}
