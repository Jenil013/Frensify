import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import ModuleSessionShell from "../tcf/ModuleSessionShell";
import WritingTextAreaField from "../WritingTextAreaField";
import WritingFeedbackModal from "../WritingFeedbackModal";
import AiEvaluatingModal from "../AiEvaluatingModal";
import { evaluateWritingModule } from "../../api";
import {
  TefModuleDefinition,
  WritingModuleResult,
} from "../../types";

interface TefWritingModuleRunnerProps {
  module: TefModuleDefinition;
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

const MODULE_DURATION_SECONDS = 60 * 60;

const SECTION_PACING_NOTES = {
  A: "Section A (Journalistic Report - ~25 mins)",
  B: "Section B (Argumentative Letter - ~35 mins)",
} as const;

export default function TefWritingModuleRunner({
  module,
  examMode = true,
  onComplete,
  onAbort,
}: TefWritingModuleRunnerProps) {
  const sections = module.meta.sections!;
  const sectionA = module.sections!["A"];
  const sectionB = module.sections!["B"];
  const metaA = sections.find((s) => s.id === "A")!;
  const metaB = sections.find((s) => s.id === "B")!;

  const [currentSection, setCurrentSection] = useState<"A" | "B">("A");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(MODULE_DURATION_SECONDS);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<WritingModuleResult | null>(null);
  const submittedRef = useRef(false);

  const activeMeta = currentSection === "A" ? metaA : metaB;
  const activeText = currentSection === "A" ? textA : textB;
  const setActiveText = currentSection === "A" ? setTextA : setTextB;
  const activeContent = currentSection === "A" ? sectionA : sectionB;
  const minWords = activeMeta.minWords ?? 0;
  const words = wordCount(activeText);
  const underMinWords = words < minWords;

  const buildEvalPayload = useCallback(
    () => [
      {
        section_id: "A",
        prompt: sectionA.prompt,
        essay_text: textA,
        word_count: wordCount(textA),
        task_number: `TEF ${metaA.label}`,
        min_words: metaA.minWords ?? 0,
      },
      {
        section_id: "B",
        prompt: sectionB.prompt,
        essay_text: textB,
        word_count: wordCount(textB),
        task_number: `TEF ${metaB.label}`,
        min_words: metaB.minWords ?? 0,
      },
    ],
    [sectionA.prompt, textA, metaA.label, metaA.minWords, sectionB.prompt, textB, metaB.label, metaB.minWords]
  );

  const buildDraftResult = useCallback(
    (): WritingModuleResult => ({
      sections: [
        { sectionId: "A", text: textA, wordCount: wordCount(textA) },
        { sectionId: "B", text: textB, wordCount: wordCount(textB) },
      ],
    }),
    [textA, textB]
  );

  const finishModule = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setError(null);
    const payload = buildEvalPayload();

    if (examMode) {
      const draft = buildDraftResult();
      const pendingEval = evaluateWritingModule(
        "expression-ecrite",
        "TEF",
        payload,
        "mock"
      ).then((evaluated) => ({ sections: evaluated }));
      onComplete(draft, { pendingEval });
      return;
    }

    setEvaluating(true);
    try {
      const sectionResults = await evaluateWritingModule(
        "expression-ecrite",
        "TEF",
        payload,
        "practice"
      );
      setPendingResult({ sections: sectionResults });
    } catch (err: unknown) {
      submittedRef.current = false;
      setError(
        err instanceof Error
          ? err.message
          : "Writing evaluation failed. Please try again."
      );
    } finally {
      setEvaluating(false);
    }
  }, [buildEvalPayload, buildDraftResult, examMode, onComplete]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) {
      void finishModule();
    }
  }, [secondsLeft, finishModule]);

  const dismissFeedback = useCallback(() => {
    if (pendingResult) {
      onComplete(pendingResult);
      setPendingResult(null);
    }
  }, [pendingResult, onComplete]);

  const feedbackSections =
    pendingResult?.sections
      .filter((s) => s.feedback)
      .map((s) => ({
        label: s.sectionId === "A" ? "Section A" : "Section B",
        feedback: s.feedback!,
      })) ?? [];

  const footer = (
    <div className="flex flex-col items-end gap-2">
      {underMinWords && (
        <p className="text-[11px] text-[#9A5013]">
          Below the {minWords}-word minimum - submitting early may lower your
          score.
        </p>
      )}
      <button
        type="button"
        disabled={!examMode && evaluating}
        onClick={() => void finishModule()}
        className="px-4 py-2 bg-[#2D6A53] text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer"
      >
        {!examMode && evaluating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />{" "}
            {examMode ? "Submit & continue" : "Submit module"}
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
          title="TEF expression écrite - your results"
          sections={feedbackSections}
          continueLabel="Back to practice"
        />
      )}

      <ModuleSessionShell
        title={`TEF · ${module.meta.labelFr}`}
        objective={module.meta.objective}
        secondsRemaining={secondsLeft}
        currentSection={currentSection}
        sectionLabels={{
          A: "Section A",
          B: "Section B",
        }}
        onSectionChange={setCurrentSection}
        onAbort={onAbort}
        footer={footer}
      >
        <div className="space-y-3">
          {error && (
            <p className="text-xs text-[#B83E5C] bg-[#FDF2F4] border border-[#F5D0D6] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <p className="text-xs font-bold text-[#37352F]">
            {SECTION_PACING_NOTES[currentSection]}
          </p>
          {activeContent.stimulus && (
            <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-4 text-sm font-semibold text-[#37352F] leading-relaxed">
              {activeContent.stimulus}
            </div>
          )}
          <WritingTextAreaField
            prompt={activeContent.prompt}
            value={activeText}
            onChange={setActiveText}
          />
          <p className="text-[11px] text-right font-mono text-[#7A7A78]">
            Words:{" "}
            <strong className={words >= minWords ? "text-[#10B981]" : ""}>
              {words}
            </strong>{" "}
            / {minWords} min
          </p>
        </div>
      </ModuleSessionShell>
    </>
  );
}
