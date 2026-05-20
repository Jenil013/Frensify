import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import ModuleSessionShell from "./ModuleSessionShell";
import { evaluateWriting } from "../../api";
import {
  ExamPathway,
  TcfModuleDefinition,
  WritingModuleResult,
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

export default function WritingModuleRunner({
  module,
  examType,
  onComplete,
  onAbort,
}: WritingModuleRunnerProps) {
  const sections = module.meta.sections!;
  const sectionA = module.sections!.A;
  const sectionB = module.sections!.B;
  const metaA = sections.find((s) => s.id === "A")!;
  const metaB = sections.find((s) => s.id === "B")!;

  const [currentSection, setCurrentSection] = useState<"A" | "B">("A");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(metaA.durationMinutes * 60);
  const [loading, setLoading] = useState(false);
  const [resultA, setResultA] = useState<WritingModuleResult["sections"][0] | null>(null);

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

  const submitSectionA = useCallback(async () => {
    if (words < minWords) return;
    setLoading(true);
    try {
      const feedback = await evaluateWriting(
        sectionA.prompt,
        textA,
        "expression-ecrite-A",
        examType,
        "A"
      );
      const sectionResult = {
        sectionId: "A" as const,
        text: textA,
        wordCount: words,
        feedback,
      };
      setResultA(sectionResult);
      setCurrentSection("B");
    } finally {
      setLoading(false);
    }
  }, [words, minWords, sectionA.prompt, textA, examType]);

  const finishModule = useCallback(async () => {
    if (words < minWords) return;
    setLoading(true);
    try {
      const feedbackB = await evaluateWriting(
        sectionB.prompt,
        textB,
        "expression-ecrite-B",
        examType,
        "B"
      );
      const sectionsOut: WritingModuleResult["sections"] = [
        resultA ?? {
          sectionId: "A",
          text: textA,
          wordCount: wordCount(textA),
        },
        {
          sectionId: "B",
          text: textB,
          wordCount: wordCount(textB),
          feedback: feedbackB,
        },
      ];
      if (!resultA) {
        const feedbackA = await evaluateWriting(
          sectionA.prompt,
          textA,
          "expression-ecrite-A",
          examType,
          "A"
        );
        sectionsOut[0] = {
          sectionId: "A",
          text: textA,
          wordCount: wordCount(textA),
          feedback: feedbackA,
        };
      }
      onComplete({ sections: sectionsOut });
    } finally {
      setLoading(false);
    }
  }, [
    words,
    minWords,
    sectionB.prompt,
    textB,
    examType,
    resultA,
    textA,
    sectionA.prompt,
    onComplete,
  ]);

  const footer = (
    <div className="flex justify-end">
      {currentSection === "A" ? (
        <button
          type="button"
          disabled={loading || words < minWords}
          onClick={submitSectionA}
          className="px-4 py-2 bg-[#37352F] text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Complete Section A <ChevronRight className="w-4 h-4" />
            </>
          )}
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
    <ModuleSessionShell
      title={module.meta.labelFr}
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
  );
}
