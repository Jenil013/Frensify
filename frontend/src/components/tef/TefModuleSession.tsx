import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadTefModule } from "../../services/questionBank";
import {
  TefModuleCompletionResult,
  TefModuleDefinition,
  TefModuleId,
} from "../../types";
import TefMcqModuleRunner from "./TefMcqModuleRunner";
import TefWritingModuleRunner from "./TefWritingModuleRunner";
import TefOralModuleRunner from "./TefOralModuleRunner";

interface TefModuleSessionProps {
  moduleId: TefModuleId;
  onComplete: (result: TefModuleCompletionResult) => void;
  onAbort: () => void;
  examMode?: boolean;
  freeSet?: 1 | 2;
}

export default function TefModuleSession({
  moduleId,
  onComplete,
  onAbort,
  examMode = true,
  freeSet,
}: TefModuleSessionProps) {
  const [module, setModule] = useState<TefModuleDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTefModule(moduleId, examMode, freeSet)
      .then((def) => {
        if (!cancelled) setModule(def);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load module");
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId, examMode, freeSet]);

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
      <TefMcqModuleRunner
        module={module}
        isListening={isListening}
        examMode={examMode}
        onAbort={onAbort}
        onComplete={(result) =>
          onComplete({ type: "mcq", moduleId, result })
        }
      />
    );
  }

  if (moduleId === "expression-ecrite") {
    return (
      <TefWritingModuleRunner
        module={module}
        examMode={examMode}
        onAbort={onAbort}
        onComplete={(result, options) =>
          onComplete({
            type: "writing",
            moduleId,
            result,
            pendingEval: options?.pendingEval,
          })
        }
      />
    );
  }

  return (
    <TefOralModuleRunner
      module={module}
      examMode={examMode}
      onAbort={onAbort}
      onComplete={(result, options) =>
        onComplete({
          type: "oral",
          moduleId,
          result,
          pendingEval: options?.pendingEval,
        })
      }
    />
  );
}
