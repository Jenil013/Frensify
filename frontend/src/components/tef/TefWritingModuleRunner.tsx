import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import ModuleSessionShell from "../tcf/ModuleSessionShell";
import WritingFeedbackModal from "../WritingFeedbackModal";
import { evaluateWritingModule } from "../../api";
import {
  TefModuleDefinition,
  WritingModuleResult,
} from "../../types";

interface TefWritingModuleRunnerProps {
  module: TefModuleDefinition;
  examMode?: boolean;
  onComplete: (result: WritingModuleResult) => void;
  onAbort?: () => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

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
  const [secondsLeft, setSecondsLeft] = useState(metaA.durationMinutes * 60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<WritingModuleResult | null>(null);

  const activeMeta = currentSection === "A" ? metaA : metaB;
  const activeText = currentSection === "A" ? textA : textB;
  const setActiveText = currentSection === "A" ? setTextA : setTextB;
  const activeContent = currentSection === "A" ? sectionA : sectionB;
  const minWords = activeMeta.minWords ?? 0;
  const words = wordCount(activeText);

  useEffect(() => {
    setSecondsLeft(activeMeta.durationMinutes * 60);
  }, [currentSection, activeMeta.durationMinutes]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const finishModule = useCallback(async () => {
    if (words < minWords) return;
    setLoading(true);
    setError(null);
    try {
      const sectionResults = await evaluateWritingModule(
        "expression-ecrite",
        "TEF",
        [
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
        examMode ? "mock" : "practice"
      );
      setPendingResult({ sections: sectionResults });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Writing evaluation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    words,
    minWords,
    sectionA.prompt,
    textA,
    sectionB.prompt,
    textB,
    examMode,
  ]);

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
    <div className="flex justify-end">
      {currentSection === "A" ? (
        <button
          type="button"
          disabled={loading || words < minWords}
          onClick={() => setCurrentSection("B")}
          className="px-4 py-2 bg-[#37352F] text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          <>
            Complete Section A <ChevronRight className="w-4 h-4" />
          </>
        </button>
      ) : (
        <button
          type="button"
          disabled={loading || words < minWords}
          onClick={finishModule}
          className="px-4 py-2 bg-[#2D6A53] text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Submit module
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <>
      <WritingFeedbackModal
        open={pendingResult !== null && feedbackSections.length > 0}
        onClose={dismissFeedback}
        title="TEF expression écrite — your results"
        sections={feedbackSections}
        continueLabel={examMode ? "Continue mock test" : "Back to practice"}
      />

      <ModuleSessionShell
      title={`TEF · ${module.meta.labelFr}`}
      objective={module.meta.objective}
      secondsRemaining={secondsLeft}
      currentSection={currentSection}
      sectionLabels={{
        A: `A · ${metaA.durationMinutes} min`,
        B: `B · ${metaB.durationMinutes} min`,
      }}
      onAbort={onAbort}
      footer={footer}
    >
      <div className="space-y-3">
        {error && (
          <p className="text-xs text-[#B83E5C] bg-[#FDF2F4] border border-[#F5D0D6] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <p className="text-xs font-bold text-[#37352F]">{activeMeta.label}</p>
        {activeContent.stimulus && (
          <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-4 text-xs italic leading-relaxed">
            {activeContent.stimulus}
          </div>
        )}
        <p className="text-xs text-[#5F5E5B]">{activeContent.prompt}</p>
        <textarea
          value={activeText}
          onChange={(e) => setActiveText(e.target.value)}
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
        </p>
      </div>
    </ModuleSessionShell>
    </>
  );
}
