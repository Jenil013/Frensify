import React, { useEffect } from "react";
import { Award, ChevronRight, X } from "lucide-react";
import type { AISpeakingSuggestion, ExamPathway, OralSectionResult } from "../types";

export interface SpeakingResultsPayload {
  examType: ExamPathway;
  moduleLabel: string;
  sectionLabels: string[];
  sections: OralSectionResult[];
}

interface SpeakingResultsModalProps {
  open: boolean;
  onClose: () => void;
  payload: SpeakingResultsPayload | null;
}

function SectionReview({
  label,
  cue,
  feedback,
}: {
  label: string;
  cue?: string;
  feedback: AISpeakingSuggestion;
}) {
  return (
    <article className="border border-[#E9E9E7] rounded-xl bg-white p-4 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-[#37352F]">{label}</h3>
        <span className="text-[11px] font-bold uppercase tracking-wide bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] px-2.5 py-1 rounded-full">
          CEFR {feedback.cefrLevel}
        </span>
      </div>

      {cue && (
        <p className="text-xs text-[#5F5E5B] bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3 leading-relaxed">
          <span className="font-bold text-[#37352F]">Examiner cue: </span>
          {cue}
        </p>
      )}

      <div className="space-y-2 text-xs text-[#37352F] leading-relaxed">
        <p>
          <span className="font-bold">Fluency: </span>
          {feedback.fluencyFeedback}
        </p>
        <p>
          <span className="font-bold">Grammar & vocabulary: </span>
          {feedback.grammarAndVocab}
        </p>
        <p>
          <span className="font-bold">Structure: </span>
          {feedback.structureAnalysis}
        </p>
      </div>

      {feedback.pronunciationTips.length > 0 && (
        <ul className="text-xs text-[#5F5E5B] space-y-1 list-disc pl-4">
          {feedback.pronunciationTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}

      {feedback.suggestedPhrases.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
            Phrases to practice
          </p>
          {feedback.suggestedPhrases.slice(0, 2).map((phrase) => (
            <div
              key={phrase.french}
              className="text-xs bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3"
            >
              <p className="font-medium text-[#37352F]">{phrase.french}</p>
              <p className="text-[#7A7A78] mt-0.5">{phrase.english}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function weakestSection(
  sections: OralSectionResult[]
): OralSectionResult | undefined {
  const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return [...sections]
    .filter((s) => s.feedback)
    .sort(
      (a, b) =>
        order.indexOf(a.feedback!.cefrLevel) - order.indexOf(b.feedback!.cefrLevel)
    )[0];
}

export default function SpeakingResultsModal({
  open,
  onClose,
  payload,
}: SpeakingResultsModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open || !payload) return null;

  const levels = payload.sections
    .map((s) => s.feedback?.cefrLevel)
    .filter(Boolean) as string[];
  const overall =
    levels.length > 0
      ? levels.reduce((min, l) => {
          const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
          return order.indexOf(l) < order.indexOf(min) ? l : min;
        }, levels[0])
      : "—";

  const weak = weakestSection(payload.sections);
  const weakLabel =
    weak &&
    payload.sectionLabels[
      payload.sections.findIndex((s) => s.sectionId === weak.sectionId)
    ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaking-results-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#37352F]/30 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-xl border border-[#E9E9E7] flex flex-col animate-fade-in">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#E9E9E7] shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 p-2 bg-[#EAF5F1] rounded-xl shrink-0">
              <Award className="w-5 h-5 text-[#2D6A53]" />
            </div>
            <div className="min-w-0">
              <h2
                id="speaking-results-title"
                className="text-base font-bold text-[#37352F] tracking-tight"
              >
                {payload.moduleLabel} — Results
              </h2>
              <p className="text-xs text-[#7A7A78] mt-0.5">
                {payload.examType} practice evaluation · CEFR is an estimate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7A78] hover:bg-[#F1F1EF] hover:text-[#37352F] transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#E9E9E7] bg-[#FAFAF9] shrink-0 flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2D6A53] tabular-nums">
              {overall}
            </span>
            <span className="text-xs text-[#7A7A78]">overall estimate</span>
          </div>
          <span className="text-xs text-[#5F5E5B]">
            {payload.sections.length} task
            {payload.sections.length > 1 ? "s" : ""} evaluated
          </span>
        </div>

        {weakLabel && (
          <div className="px-6 py-3 bg-[#FEF9E7] border-b border-[#F5E6A8] shrink-0 flex items-start gap-2 text-xs text-[#37352F]">
            <ChevronRight className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <p>
              <span className="font-bold">Next action: </span>
              Retry <span className="font-bold">{weakLabel}</span> with timed
              practice — focus on fluency and clearer structure before your next
              mock.
            </p>
          </div>
        )}

        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
          {payload.sections.map((section, idx) =>
            section.feedback ? (
              <SectionReview
                key={section.sectionId}
                label={payload.sectionLabels[idx] ?? section.sectionId}
                cue={section.examinerCue}
                feedback={section.feedback}
              />
            ) : null
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E9E9E7] shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#37352F] hover:bg-[#2B2A28] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Back to practice
          </button>
        </div>
      </div>
    </div>
  );
}
