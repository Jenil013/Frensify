import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ModuleSessionShell from "../tcf/ModuleSessionShell";
import ListeningAudioPlayer from "../tcf/ListeningAudioPlayer";
import { McqItem, McqModuleResult, TefModuleDefinition } from "../../types";

interface TefMcqModuleRunnerProps {
  module: TefModuleDefinition;
  isListening: boolean;
  onComplete: (result: McqModuleResult) => void;
  onAbort?: () => void;
  examMode?: boolean;
}

function scoreAnswers(questions: McqItem[], answers: (number | null)[]): number {
  return questions.reduce((acc, q, i) => {
    if (answers[i] === q.correctChoiceIndex) return acc + 1;
    return acc;
  }, 0);
}

export default function TefMcqModuleRunner({
  module,
  isListening,
  onComplete,
  onAbort,
  examMode = true,
}: TefMcqModuleRunnerProps) {
  const questions = module.questions ?? [];
  const total = questions.length;
  const durationSec = module.meta.durationMinutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(durationSec);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array(total).fill(null)
  );
  const [phase, setPhase] = useState<"active" | "review" | "done">("active");

  const finishModule = useCallback(() => {
    const rawScore = scoreAnswers(questions, answers);
    onComplete({ rawScore, maxScore: total, answers, questions });
    setPhase("done");
  }, [answers, onComplete, questions, total]);

  useEffect(() => {
    if (phase !== "active" || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase === "active" && secondsLeft <= 0) finishModule();
  }, [secondsLeft, phase, finishModule]);

  const q = questions[currentIndex];
  if (!q) return null;

  const setAnswer = (choiceIndex: number) => {
    if (phase !== "active") return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = choiceIndex;
      return next;
    });
  };

  const footer =
    phase === "active" ? (
      <div className="flex justify-between items-center">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="px-3 py-1.5 border border-[#E9E9E7] text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>
        <button
          type="button"
          onClick={finishModule}
          className="px-3 py-1.5 bg-[#2D6A53] text-white text-xs font-bold rounded-lg cursor-pointer"
        >
          Submit module
        </button>
        {currentIndex < total - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            className="px-3 py-1.5 bg-[#37352F] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="w-20" />
        )}
      </div>
    ) : null;

  const rawScore = scoreAnswers(questions, answers);

  return (
    <ModuleSessionShell
      title={`TEF · ${module.meta.labelFr}`}
      objective={`${module.meta.objective} — ${total} questions, +1/0 scoring.`}
      secondsRemaining={phase === "active" ? secondsLeft : 0}
      progressLabel={`Question ${currentIndex + 1}/${total}`}
      onAbort={phase === "active" ? onAbort : undefined}
      footer={footer}
    >
      {phase === "review" || phase === "done" ? (
        examMode ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-lg font-bold text-[#37352F]">Module complete</p>
            <p className="text-3xl font-extrabold text-[#2D6A53]">
              {rawScore}/{total}
            </p>
            <p className="text-xs text-[#7A7A78]">
              Correct answer = +1 point · Wrong or blank = 0 points
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#7A7A78]">
            Preparing your results…
          </div>
        )
      ) : (
        <div className="space-y-4">
          {isListening && (
            <ListeningAudioPlayer
              audioUrl={q.audioUrl}
              imageUrl={q.imageUrl}
              transcript={q.transcript}
              examMode={examMode}
              questionKey={q.id}
            />
          )}

          {!isListening && q.passage && (
            <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-4 text-xs leading-relaxed max-h-48 overflow-y-auto">
              {q.passage}
            </div>
          )}

          <p className="text-xs font-bold text-[#7A7A78] uppercase">{q.prompt}</p>

          <div className="space-y-2">
            {q.choices.map((choice, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAnswer(i)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                  answers[currentIndex] === i
                    ? "bg-[#EBF3FC] border-[#1A73E8] font-bold text-[#1D74B4]"
                    : "bg-white border-[#E9E9E7] hover:bg-[#FAFAF9]"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}
    </ModuleSessionShell>
  );
}
