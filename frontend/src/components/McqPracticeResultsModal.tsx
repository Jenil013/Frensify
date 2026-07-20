import React, { useEffect } from "react";
import { Award, CheckCircle2, Circle, X } from "lucide-react";
import ListeningAudioPlayer from "./tcf/ListeningAudioPlayer";
import type { ExamPathway, McqItem } from "../types";
import {
  estimateMcqCefr,
  getOfficialMcqMax,
  type McqComprehensionModuleId,
} from "../utils/mcqScoring";

const CHOICE_LABELS = ["A", "B", "C", "D", "E", "F"];

export interface McqPracticeResultsPayload {
  examType: ExamPathway;
  moduleId: McqComprehensionModuleId;
  moduleLabel: string;
  isListening: boolean;
  rawScore: number;
  maxScore: number;
  answers: (number | null)[];
  questions: McqItem[];
}

interface McqPracticeResultsModalProps {
  open: boolean;
  onClose: () => void;
  payload: McqPracticeResultsPayload | null;
}

function ChoiceRow({
  label,
  text,
  state,
}: {
  label: string;
  text: string;
  state: "neutral" | "correct" | "wrong-selected";
}) {
  const styles =
    state === "correct"
      ? "bg-[#22C55E] border-[#16A34A] text-white"
      : state === "wrong-selected"
        ? "bg-[#EF4444] border-[#DC2626] text-white"
        : "bg-[#F0F2F5] border-[#E5E7EB] text-[#37352F]";

  const Icon =
    state === "correct" ? (
      <CheckCircle2 className="w-4 h-4 shrink-0 text-white" aria-hidden />
    ) : state === "wrong-selected" ? (
      <CheckCircle2 className="w-4 h-4 shrink-0 text-white" aria-hidden />
    ) : (
      <Circle className="w-4 h-4 shrink-0 text-[#9CA3AF]" aria-hidden />
    );

  return (
    <div
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${styles}`}
    >
      {Icon}
      <span className="font-bold shrink-0 w-5">{label}</span>
      <span className="flex-1 leading-snug">{text}</span>
    </div>
  );
}

function QuestionReview({
  question,
  questionIndex,
  selectedIndex,
  isListening,
}: {
  question: McqItem;
  questionIndex: number;
  selectedIndex: number | null;
  isListening: boolean;
}) {
  const correctIndex = question.correctChoiceIndex;
  const isCorrect = selectedIndex === correctIndex;
  const isWrong = !isCorrect;

  return (
    <article className="border border-[#E9E9E7] rounded-xl bg-white p-4 space-y-3 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
            Question {questionIndex + 1}
          </p>
          {question.difficulty && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A53]">
              {question.difficulty}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-[#37352F] leading-relaxed">
          {question.prompt}
        </p>
      </div>

      {isListening && (
        <ListeningAudioPlayer
          audioUrl={question.audioUrl}
          imageUrl={question.imageUrl}
          transcript={question.transcript}
          examMode={false}
          questionKey={question.id}
        />
      )}

      {question.passage && (
        <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3 text-xs text-[#5F5E5B] leading-relaxed max-h-32 overflow-y-auto">
          {question.passage}
        </div>
      )}

      {!isListening && question.transcript && (
        <details className="text-xs">
          <summary className="font-bold text-[#7A7A78] cursor-pointer">
            Show transcript
          </summary>
          <p className="mt-2 text-[#5F5E5B] leading-relaxed">{question.transcript}</p>
        </details>
      )}

      <div className="space-y-2">
        {question.choices.map((choice, i) => {
          let state: "neutral" | "correct" | "wrong-selected" = "neutral";
          if (isCorrect && i === correctIndex) {
            state = "correct";
          } else if (isWrong) {
            if (i === correctIndex) state = "correct";
            else if (i === selectedIndex) state = "wrong-selected";
          }
          return (
            <ChoiceRow
              key={i}
              label={CHOICE_LABELS[i] ?? String(i + 1)}
              text={choice}
              state={state}
            />
          );
        })}
      </div>

      {question.explanation && (isWrong || selectedIndex == null) && (
        <p className="text-xs text-[#5F5E5B] bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3 leading-relaxed">
          <span className="font-bold text-[#37352F]">Explanation: </span>
          {question.explanation}
        </p>
      )}
    </article>
  );
}

export default function McqPracticeResultsModal({
  open,
  onClose,
  payload,
}: McqPracticeResultsModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open || !payload) return null;

  const officialMax = getOfficialMcqMax(payload.examType, payload.moduleId);
  const cefr = estimateMcqCefr(
    payload.moduleId,
    payload.rawScore,
    payload.maxScore
  );
  const displayScore = `${payload.rawScore}/${officialMax}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcq-practice-results-title"
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
                id="mcq-practice-results-title"
                className="text-base font-bold text-[#37352F] tracking-tight"
              >
                {payload.moduleLabel} - Results
              </h2>
              <p className="text-xs text-[#7A7A78] mt-0.5">
                {payload.examType} practice · +1/0 scoring · CEFR is an estimate
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
              {displayScore}
            </span>
            <span className="text-xs text-[#7A7A78]">correct</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] px-3 py-1.5 rounded-full">
            CEFR {cefr}
          </span>
          <span className="text-xs text-[#5F5E5B] ml-auto">
            {payload.rawScore} of {payload.maxScore} items in this session
          </span>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
            Answer review
          </p>
          {payload.questions.map((q, i) => (
            <QuestionReview
              key={q.id}
              question={q}
              questionIndex={i}
              selectedIndex={payload.answers[i] ?? null}
              isListening={payload.isListening}
            />
          ))}
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
