import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadTcfModule } from "../../services/questionBank";
import {
  ExamPathway,
  TcfModuleCompletionResult,
  TcfModuleDefinition,
  TcfModuleId,
} from "../../types";
import McqModuleRunner from "./McqModuleRunner";
import WritingModuleRunner from "./WritingModuleRunner";
import OralModuleRunner from "./OralModuleRunner";

interface TcfModuleSessionProps {
  moduleId: TcfModuleId;
  examType: ExamPathway;
  onComplete: (result: TcfModuleCompletionResult) => void;
  onAbort: () => void;
  examMode?: boolean;
}

export default function TcfModuleSession({
  moduleId,
  examType,
  onComplete,
  onAbort,
  examMode = true,
}: TcfModuleSessionProps) {
  const [module, setModule] = useState<TcfModuleDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTcfModule(moduleId)
      .then((def) => {
        if (!cancelled) setModule(def);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load module");
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  if (error) {
    return (
      <div className="p-6 text-center text-sm text-[#B83E5C]">{error}</div>
    );
  }

  if (!module) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A7A78]" />
      </div>
    );
  }

  if (module.meta.format === "mcq") {
    const isListening = moduleId === "comprehension-orale";
    return (
      <McqModuleRunner
        module={module}
        isListening={isListening}
        examMode={examMode}
        onAbort={onAbort}
        onComplete={(result) => onComplete({ type: "mcq", result })}
      />
    );
  }

  if (moduleId === "expression-ecrite") {
    return (
      <WritingModuleRunner
        module={module}
        examType={examType}
        onAbort={onAbort}
        onComplete={(result) => onComplete({ type: "writing", result })}
      />
    );
  }

  return (
    <OralModuleRunner
      module={module}
      examType={examType}
      examMode={examMode}
      onAbort={onAbort}
      onComplete={(result) => onComplete({ type: "oral", result })}
    />
  );
}
