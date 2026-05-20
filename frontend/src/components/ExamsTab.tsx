import React, { useState } from "react";
import { Lock, Play, Award } from "lucide-react";
import {
  UserProfile,
  TcfMockModuleResult,
  TcfModuleCompletionResult,
  TcfModuleId,
} from "../types";
import { MOCK_EXAMS_DB } from "../constants";
import { TCF_MODULE_ORDER, getModuleLabel } from "../tcfConstants";
import TcfModuleSession from "./tcf/TcfModuleSession";

interface ExamsTabProps {
  profile: UserProfile;
  onNavigateToPricing: () => void;
  onSaveMockScore: (
    examId: string,
    name: string,
    scorePct: number,
    cefr: string,
    moduleBreakdown?: TcfMockModuleResult[]
  ) => void;
  onSaveModuleScore?: (
    moduleId: TcfModuleId,
    rawScore: number,
    maxScore: number,
    examContext: string
  ) => void;
}

type ModuleResultsMap = Partial<Record<TcfModuleId, TcfModuleCompletionResult>>;

function buildModuleBreakdown(
  results: ModuleResultsMap
): TcfMockModuleResult[] {
  return TCF_MODULE_ORDER.map((moduleId) => {
    const label = getModuleLabel(moduleId);
    const r = results[moduleId];
    if (!r) return { moduleId, moduleLabel: label };

    if (r.type === "mcq") {
      const pct = Math.round((r.result.rawScore / r.result.maxScore) * 100);
      return {
        moduleId,
        moduleLabel: label,
        rawScore: r.result.rawScore,
        maxScore: r.result.maxScore,
        scorePct: pct,
      };
    }
    if (r.type === "writing") {
      return {
        moduleId,
        moduleLabel: label,
        sectionCefr: {
          A: r.result.sections[0]?.feedback?.cefrScore,
          B: r.result.sections[1]?.feedback?.cefrScore,
        },
      };
    }
    return {
      moduleId,
      moduleLabel: label,
      sectionCefr: {
        A: r.result.sections[0]?.feedback?.cefrLevel,
        B: r.result.sections[1]?.feedback?.cefrLevel,
      },
    };
  });
}

function aggregateScorePct(breakdown: TcfMockModuleResult[]): number {
  const mcq = breakdown.filter((b) => b.maxScore != null && b.rawScore != null);
  if (mcq.length === 0) return 0;
  const totalRaw = mcq.reduce((a, b) => a + (b.rawScore ?? 0), 0);
  const totalMax = mcq.reduce((a, b) => a + (b.maxScore ?? 0), 0);
  return totalMax > 0 ? Math.round((totalRaw / totalMax) * 100) : 0;
}

export default function ExamsTab({
  profile,
  onNavigateToPricing,
  onSaveMockScore,
  onSaveModuleScore,
}: ExamsTabProps) {
  const [activeSessionExam, setActiveSessionExam] = useState<
    (typeof MOCK_EXAMS_DB)[0] | null
  >(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [moduleResults, setModuleResults] = useState<ModuleResultsMap>({});
  const [showResults, setShowResults] = useState(false);

  const handleStartExam = (exam: (typeof MOCK_EXAMS_DB)[0]) => {
    if (profile.tier === "Free") {
      onNavigateToPricing();
      return;
    }
    if (exam.isMaxOnly && profile.tier !== "Max") {
      onNavigateToPricing();
      return;
    }
    if (exam.examType !== "TCF") {
      window.alert(
        "Full 4-module TCF simulation is available for TCF pathway. Switch your target exam in Settings."
      );
      return;
    }

    setActiveSessionExam(exam);
    setCurrentModuleIndex(0);
    setModuleResults({});
    setShowResults(false);
  };

  const handleModuleComplete = (result: TcfModuleCompletionResult) => {
    const moduleId = TCF_MODULE_ORDER[currentModuleIndex];
    const nextResults = { ...moduleResults, [moduleId]: result };
    setModuleResults(nextResults);

    if (result.type === "mcq" && onSaveModuleScore) {
      onSaveModuleScore(
        moduleId,
        result.result.rawScore,
        result.result.maxScore,
        activeSessionExam?.name ?? "TCF module"
      );
    }

    if (currentModuleIndex < TCF_MODULE_ORDER.length - 1) {
      setCurrentModuleIndex((i) => i + 1);
      return;
    }

    const breakdown = buildModuleBreakdown(nextResults);
    const scorePct = aggregateScorePct(breakdown);
    const cefr =
      scorePct >= 85 ? "C1" : scorePct >= 70 ? "B2" : scorePct >= 50 ? "B1" : "A2";

    if (activeSessionExam) {
      onSaveMockScore(
        activeSessionExam.id,
        activeSessionExam.name,
        scorePct,
        cefr,
        breakdown
      );
    }
    setShowResults(true);
  };

  const matchedExams = MOCK_EXAMS_DB.filter(
    (ex) => ex.examType === profile.targetExam
  );

  const activeModuleId = TCF_MODULE_ORDER[currentModuleIndex];

  return (
    <div id="exams-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      {!activeSessionExam ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#37352F]">
              Exam Simulations
            </h2>
            <p className="text-xs text-[#7A7A78]">
              Official-format TCF modules: 40+40 MCQs, written A/B, oral A/B (~175
              min total).
            </p>
          </div>

          {profile.tier === "Free" && (
            <div className="bg-[#FDF3E7] border border-[#FCE1CA] rounded-xl p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
              <div className="space-y-1">
                <h4 className="font-bold text-[#9A5013] text-sm uppercase tracking-wide">
                  Pro required for full simulations
                </h4>
                <p className="text-xs text-[#9A5013] leading-relaxed max-w-xl">
                  Unlock timed TCF modules with +1/0 comprehension scoring and AI
                  rubrics for expression sections.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToPricing}
                className="px-4 py-2 bg-[#9A5013] hover:bg-[#834310] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                View plans
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {matchedExams.map((exam) => {
              const maxLocked = exam.isMaxOnly && profile.tier !== "Max";
              const normalLocked = profile.tier === "Free";
              const locked = normalLocked || maxLocked;

              return (
                <div
                  key={exam.id}
                  className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[9px] font-bold uppercase bg-[#F1F1EF] px-2 py-0.5 rounded border">
                      {exam.examType}
                    </span>
                    <h3 className="text-sm font-bold">{exam.name}</h3>
                    <p className="text-xs text-[#7A7A78] leading-relaxed">
                      {exam.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-[#9B9A97] font-mono pt-1">
                      <span>⏱️ {exam.estimatedDurationMin} min</span>
                      <span>📖 {exam.readingsCount} reading</span>
                      <span>🎧 {exam.listeningsCount} listening</span>
                      <span>✍️ {exam.writingCount} writing sections</span>
                      <span>🎤 {exam.speakingCount} oral sections</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {locked ? (
                      <button
                        type="button"
                        onClick={onNavigateToPricing}
                        className="px-4 py-2 border rounded-lg text-xs font-bold text-[#7B7B79] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" /> Unlock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartExam(exam)}
                        className="px-4 py-2 bg-[#2D6A53] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start TCF mock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : showResults ? (
        <ResultsPanel
          breakdown={buildModuleBreakdown(moduleResults)}
          examName={activeSessionExam.name}
          onClose={() => setActiveSessionExam(null)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">{activeSessionExam.name}</span>
            <span className="text-[#7A7A78]">
              Module {currentModuleIndex + 1}/{TCF_MODULE_ORDER.length}:{" "}
              {getModuleLabel(activeModuleId)}
            </span>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm("Abort simulation? Progress will be lost.")
                ) {
                  setActiveSessionExam(null);
                }
              }}
              className="text-[#B83E5C] font-semibold hover:underline cursor-pointer"
            >
              Abort
            </button>
          </div>

          <div className="flex gap-1 p-1 bg-[#F1F1EF] rounded-lg overflow-x-auto">
            {TCF_MODULE_ORDER.map((id, idx) => (
              <div
                key={id}
                className={`px-2 py-1 rounded text-[10px] shrink-0 ${
                  idx === currentModuleIndex
                    ? "bg-white font-bold border shadow-sm"
                    : idx < currentModuleIndex
                    ? "text-[#2D6A53]"
                    : "text-[#9B9A97]"
                }`}
              >
                {getModuleLabel(id)}
              </div>
            ))}
          </div>

          <TcfModuleSession
            key={activeModuleId}
            moduleId={activeModuleId}
            examType="TCF"
            examMode
            onAbort={() => setActiveSessionExam(null)}
            onComplete={handleModuleComplete}
          />
        </div>
      )}
    </div>
  );
}

function ResultsPanel({
  breakdown,
  examName,
  onClose,
}: {
  breakdown: TcfMockModuleResult[];
  examName: string;
  onClose: () => void;
}) {
  const scorePct = aggregateScorePct(breakdown);

  return (
    <div className="bg-white border rounded-xl p-6 text-center space-y-5 shadow-premium">
      <Award className="w-10 h-10 text-[#2D6A53] mx-auto" />
      <h4 className="text-lg font-bold">{examName} — Complete</h4>
      <p className="text-xs text-[#7A7A78]">
        Comprehension modules use +1/0 scoring. Expression modules use AI CEFR
        estimates per section.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
        {breakdown.map((row) => (
          <div
            key={row.moduleId}
            className="border rounded-lg p-3 bg-[#FAFAF9] text-xs"
          >
            <p className="font-bold text-[#37352F]">{row.moduleLabel}</p>
            {row.rawScore != null && row.maxScore != null ? (
              <p className="text-[#2D6A53] font-extrabold mt-1">
                {row.rawScore}/{row.maxScore} ({row.scorePct}%)
              </p>
            ) : row.sectionCefr ? (
              <p className="text-[#5F5E5B] mt-1">
                A: {row.sectionCefr.A ?? "—"} · B: {row.sectionCefr.B ?? "—"}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <p className="text-sm font-bold">
        Comprehension aggregate: {scorePct}%
      </p>

      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-[#37352F] text-white text-xs font-bold rounded-lg cursor-pointer"
      >
        Back to simulations
      </button>
    </div>
  );
}
