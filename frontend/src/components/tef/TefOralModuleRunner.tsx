import React from "react";
import OralSimulationRunner from "../OralSimulationRunner";
import { OralModuleResult, TefModuleDefinition } from "../../types";

interface TefOralModuleRunnerProps {
  module: TefModuleDefinition;
  onComplete: (
    result: OralModuleResult,
    options?: { pendingEval?: Promise<OralModuleResult> }
  ) => void;
  onAbort?: () => void;
  examMode?: boolean;
}

const SECTION_IDS = ["A", "B"] as const;

export default function TefOralModuleRunner({
  module,
  onComplete,
  onAbort,
  examMode = true,
}: TefOralModuleRunnerProps) {
  const sectionsMeta = module.meta.sections!;
  const sectionContent = module.sections!;

  return (
    <OralSimulationRunner
      title={`TEF · ${module.meta.labelFr}`}
      objective={module.meta.objective}
      durationMinutes={module.meta.durationMinutes}
      sectionMetas={sectionsMeta.map((s) => ({
        id: s.id,
        label: s.label,
        durationMinutes: s.durationMinutes,
      }))}
      sectionIds={[...SECTION_IDS]}
      sectionContent={sectionContent}
      examType="TEF"
      exerciseId={module.combinationId ?? "tef-expression-orale-default"}
      onComplete={onComplete}
      onAbort={onAbort}
      examMode={examMode}
    />
  );
}
