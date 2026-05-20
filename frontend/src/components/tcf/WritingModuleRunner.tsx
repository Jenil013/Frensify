import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import ModuleSessionShell from "./ModuleSessionShell";
import { evaluateWriting } from "../../api";
import {
  ExamPathway,
  TcfModuleDefinition,
  WritingModuleResult,
  WritingSectionResult,
} from "../../types";

interface WritingModuleRunnerProps {
  module: TcfModuleDefinition;
  examType: ExamPathway;
  onComplete: (result: WritingModuleResult) => void;
  onAbort?: () => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const TASK_IDS = ["1", "2", "3"] as const;

export default function WritingModuleRunner({
  module,
  examType,
  onComplete,
  onAbort,
}: WritingModuleRunnerProps) {
  const sectionsMeta = module.meta.sections!;
  const sectionContent = module.sections!;

  const [currentTask, setCurrentTask] = useState(0);
  const [texts, setTexts] = useState<string[]>(["", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(
    sectionsMeta[0].durationMinutes * 60
  );
  const [loading, setLoading] = useState(false);
  const [completedResults, setCompletedResults] = useState<WritingSectionResult[]>([]);

  const taskId = TASK_IDS[currentTask];
  const meta = sectionsMeta[currentTask];
  const content = sectionContent[taskId];
  const activeText = texts[currentTask];
  const minWords = meta.minWords ?? 0;
  const words = wordCount(activeText);

  useEffect(() => {
    setSecondsLeft(sectionsMeta[currentTask].durationMinutes * 60);
  }, [currentTask, sectionsMeta]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const updateText = (value: string) => {
    setTexts((prev) => {
      const next = [...prev];
      next[currentTask] = value;
      return next;
    });
  };

  const submitCurrentTask = useCallback(async () => {
    if (words < minWords) return;
    setLoading(true);
    try {
      const feedback = await evaluateWriting(
        content.prompt,
        activeText,
        `expression-ecrite-${taskId}`,
        examType,
        taskId
      );
      const sectionResult: WritingSectionResult = {
        sectionId: taskId,
        text: activeText,
        wordCount: words,
        feedback,
      };
      const nextResults = [...completedResults, sectionResult];
      setCompletedResults(nextResults);

      if (currentTask < 2) {
        setCurrentTask((t) => t + 1);
      } else {
        onComplete({ sections: nextResults });
      }
    } finally {
      setLoading(false);
    }
  }, [
    words,
    minWords,
    content.prompt,
    activeText,
    taskId,
    examType,
    completedResults,
    currentTask,
    onComplete,
  ]);

  const isLastTask = currentTask === 2;

  const footer = (
    <div className="flex justify-end">
      <button
        type="button"
        disabled={loading || words < minWords}
        onClick={submitCurrentTask}
        className={`px-4 py-2 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer ${
          isLastTask ? "bg-[#2D6A53]" : "bg-[#37352F]"
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isLastTask ? (
          <>
            <Sparkles className="w-3.5 h-3.5" /> Submit module
          </>
        ) : (
          <>
            Complete Task {currentTask + 1} <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );

  return (
    <ModuleSessionShell
      title={module.meta.labelFr}
      objective={module.meta.objective}
      secondsRemaining={secondsLeft}
      progressLabel={`Task ${currentTask + 1}/3`}
      onAbort={onAbort}
      footer={footer}
    >
      <div className="space-y-3">
        <div className="flex gap-1 p-1 bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg">
          {TASK_IDS.map((id, idx) => (
            <div
              key={id}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs text-center ${
                idx === currentTask
                  ? "bg-white font-bold border border-[#E9E9E7] shadow-sm text-[#37352F]"
                  : idx < currentTask
                  ? "text-[#2D6A53] font-medium"
                  : "text-[#7B7B79]"
              }`}
            >
              {sectionsMeta[idx].label.split("—")[0].trim()}
            </div>
          ))}
        </div>

        <p className="text-xs font-bold text-[#37352F]">{meta.label}</p>
        {content.stimulus && (
          <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-4 text-xs italic leading-relaxed">
            {content.stimulus}
          </div>
        )}
        <p className="text-xs text-[#5F5E5B]">{content.prompt}</p>
        <textarea
          value={activeText}
          onChange={(e) => updateText(e.target.value)}
          rows={8}
          placeholder="Rédigez votre réponse en français..."
          className="w-full text-xs p-4 border border-[#E9E9E7] rounded-xl outline-none focus:border-[#1A73E8] font-mono leading-relaxed"
        />
        <p className="text-[11px] text-right font-mono text-[#7A7A78]">
          Words:{" "}
          <strong className={words >= minWords ? "text-[#10B981]" : ""}>
            {words}
          </strong>{" "}
          / {minWords} min
          {meta.maxWords && (
            <span className="ml-2">· {meta.maxWords} max</span>
          )}
        </p>
      </div>
    </ModuleSessionShell>
  );
}
