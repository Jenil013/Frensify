import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import ModuleSessionShell from "./ModuleSessionShell";
import WritingFeedbackModal from "../WritingFeedbackModal";
import AiEvaluatingModal from "../AiEvaluatingModal";
import { evaluateWritingModule } from "../../api";
import {
  ExamPathway,
  TcfModuleDefinition,
  WritingModuleResult,
} from "../../types";

interface WritingModuleRunnerProps {
  module: TcfModuleDefinition;
  examType: ExamPathway;
  examMode?: boolean;
  onComplete: (
    result: WritingModuleResult,
    options?: { pendingEval?: Promise<WritingModuleResult> }
  ) => void;
  onAbort?: () => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const TASK_IDS = ["1", "2", "3"] as const;

const DOC2_SPLIT_RE = /(?=Document\s+2\s*:)/i;
const DOC_LABEL_RE = /^Document\s+([12])\s*:\s*/i;

function Task3Stimulus({ text }: { text: string }) {
  const parts = text.split(DOC2_SPLIT_RE).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) {
    return (
      <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-4 text-sm font-semibold text-[#37352F] leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-4 space-y-5">
      {parts.map((part, index) => {
        const labelMatch = part.match(DOC_LABEL_RE);
        const label = labelMatch ? `Document ${labelMatch[1]} :` : `Document ${index + 1} :`;
        const body = labelMatch ? part.slice(labelMatch[0].length).trim() : part;
        return (
          <div
            key={index}
            className={index > 0 ? "pt-5 border-t border-[#E9E9E7]" : undefined}
          >
            <p className="text-xs font-bold not-italic text-[#37352F] mb-2">{label}</p>
            <p className="text-sm font-semibold text-[#37352F] leading-relaxed whitespace-pre-wrap">{body}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function WritingModuleRunner({
  module,
  examType,
  examMode = true,
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
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<WritingModuleResult | null>(null);

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

  const buildEvalPayload = useCallback(
    () =>
      TASK_IDS.map((id, idx) => ({
        section_id: id,
        prompt: sectionContent[id].prompt,
        essay_text: texts[idx],
        word_count: wordCount(texts[idx]),
        task_number: `${examType} ${sectionsMeta[idx].label}`,
        min_words: sectionsMeta[idx].minWords ?? 0,
      })),
    [sectionContent, texts, examType, sectionsMeta]
  );

  const buildDraftResult = useCallback(
    (): WritingModuleResult => ({
      sections: TASK_IDS.map((id, idx) => ({
        sectionId: id,
        text: texts[idx],
        wordCount: wordCount(texts[idx]),
      })),
    }),
    [texts]
  );

  const submitModule = useCallback(async () => {
    setError(null);
    const sections = buildEvalPayload();

    if (examMode) {
      const draft = buildDraftResult();
      const pendingEval = evaluateWritingModule(
        "expression-ecrite",
        examType,
        sections,
        "mock"
      ).then((evaluated) => ({ sections: evaluated }));
      onComplete(draft, { pendingEval });
      return;
    }

    setEvaluating(true);
    try {
      const sectionResults = await evaluateWritingModule(
        "expression-ecrite",
        examType,
        sections,
        "practice"
      );
      setPendingResult({ sections: sectionResults });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Writing evaluation failed. Please try again."
      );
    } finally {
      setEvaluating(false);
    }
  }, [buildEvalPayload, buildDraftResult, examType, examMode, onComplete]);

  const dismissFeedback = useCallback(() => {
    if (pendingResult) {
      onComplete(pendingResult);
      setPendingResult(null);
    }
  }, [pendingResult, onComplete]);

  const feedbackSections =
    pendingResult?.sections
      .filter((s) => s.feedback)
      .map((s, idx) => ({
        label: sectionsMeta[idx]?.label.split("—")[0].trim() ?? `Task ${idx + 1}`,
        feedback: s.feedback!,
      })) ?? [];

  const advanceOrSubmit = useCallback(async () => {
    if (words < minWords) return;
    if (currentTask < 2) {
      setCurrentTask((t) => t + 1);
      return;
    }
    await submitModule();
  }, [words, minWords, currentTask, submitModule]);

  const isLastTask = currentTask === 2;

  const footer = (
    <div className="flex justify-end">
      <button
        type="button"
        disabled={(!examMode && evaluating) || words < minWords}
        onClick={advanceOrSubmit}
        className={`px-4 py-2 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer ${
          isLastTask ? "bg-[#2D6A53]" : "bg-[#37352F]"
        }`}
      >
        {!examMode && evaluating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isLastTask ? (
          <>
            <Sparkles className="w-3.5 h-3.5" />{" "}
            {examMode ? "Submit & continue" : "Submit module"}
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
    <>
      <AiEvaluatingModal open={!examMode && evaluating} />

      {!examMode && (
        <WritingFeedbackModal
          open={pendingResult !== null && feedbackSections.length > 0}
          onClose={dismissFeedback}
          title="Expression écrite — your results"
          sections={feedbackSections}
          continueLabel="Back to practice"
        />
      )}

      <ModuleSessionShell
      title={module.meta.labelFr}
      objective={module.meta.objective}
      secondsRemaining={secondsLeft}
      progressLabel={`Task ${currentTask + 1}/3`}
      onAbort={onAbort}
      footer={footer}
    >
      <div className="space-y-3">
        {error && (
          <p className="text-xs text-[#B83E5C] bg-[#FDF2F4] border border-[#F5D0D6] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

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
        {content.stimulus && <Task3Stimulus text={content.stimulus} />}
        <p className="text-xs text-[#5F5E5B] leading-relaxed">{content.prompt}</p>
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
    </>
  );
}
