import React, { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { AIWritingCorrection } from "../types";

export interface WritingFeedbackSection {
  label: string;
  feedback: AIWritingCorrection;
}

interface WritingFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  sections: WritingFeedbackSection[];
  continueLabel?: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  coherence: "Coherence & structure",
  taskCompleteness: "Task completion",
};

function FeedbackPanel({ feedback }: { feedback: AIWritingCorrection }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] px-3 py-1 rounded-full">
          CEFR {feedback.cefrScore}
        </span>
        <span className="text-[11px] font-medium text-[#5F5E5B]">
          {feedback.scoreRange}
        </span>
      </div>

      <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] mb-2">
          Examiner summary
        </p>
        <p className="text-sm text-[#37352F] leading-relaxed">
          {feedback.overallFeedback}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(feedback.dimensionScores).map(([key, note]) => (
          <div
            key={key}
            className="bg-white border border-[#E9E9E7] rounded-xl p-3 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] mb-1">
              {DIMENSION_LABELS[key] ?? key}
            </p>
            <p className="text-xs text-[#37352F] leading-relaxed">{note}</p>
          </div>
        ))}
      </div>

      {feedback.detailedCorrections.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
            Corrections to practice
          </p>
          {feedback.detailedCorrections.map((corr, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E9E9E7] rounded-xl p-3 space-y-1.5 text-xs"
            >
              <p className="text-[#B83E5C] line-through">{corr.original}</p>
              <p className="text-[#2D6A53] font-medium">{corr.corrected}</p>
              <p className="text-[#5F5E5B] leading-relaxed">{corr.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {feedback.improvedVersion.trim() && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
            Stronger version
          </p>
          <div className="bg-[#EAF5F1]/40 border border-[#D1EBE1] rounded-xl p-4 text-xs italic text-[#37352F] leading-relaxed">
            {feedback.improvedVersion}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WritingFeedbackModal({
  open,
  onClose,
  title = "Your writing results",
  sections,
  continueLabel = "Continue",
}: WritingFeedbackModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open || sections.length === 0) {
    return null;
  }

  const active = sections[activeIndex] ?? sections[0];
  const hasMultiple = sections.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="writing-feedback-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#37352F]/30 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-[#E9E9E7] flex flex-col animate-fade-in">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#E9E9E7] shrink-0">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-0.5 p-2 bg-[#EAF5F1] rounded-xl shrink-0">
              <Sparkles className="w-4 h-4 text-[#2D6A53]" />
            </div>
            <div className="min-w-0">
              <h2
                id="writing-feedback-title"
                className="text-base font-bold text-[#37352F] tracking-tight"
              >
                {title}
              </h2>
              <p className="text-xs text-[#7A7A78] mt-0.5">
                AI examiner feedback — use this to refine your next draft.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7A78] hover:bg-[#F1F1EF] hover:text-[#37352F] transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasMultiple && (
          <div className="flex gap-1 px-6 pt-4 shrink-0">
            {sections.map((section, idx) => (
              <button
                key={section.label}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  idx === activeIndex
                    ? "bg-[#37352F] text-white"
                    : "bg-[#F1F1EF] text-[#5F5E5B] hover:bg-[#E9E9E7]"
                }`}
              >
                {section.label}
                <span className="block text-[10px] opacity-80 mt-0.5">
                  {section.feedback.cefrScore}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto px-6 py-5 flex-1">
          <FeedbackPanel feedback={active.feedback} />
        </div>

        <div className="px-6 py-4 border-t border-[#E9E9E7] shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2D6A53] hover:bg-[#245642] text-white text-xs font-bold rounded-xl transition-colors"
          >
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
