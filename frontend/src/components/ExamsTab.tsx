import React, { useState } from "react";
import { Lock, Play } from "lucide-react";
import {
  UserProfile,
  FullExamReport,
  TcfMockModuleResult,
  TcfModuleCompletionResult,
  TcfModuleId,
  TefModuleCompletionResult,
  TefModuleId,
  TefMockModuleResult,
  McqModuleResult,
  WritingModuleResult,
  OralModuleResult,
} from "../types";
import { MOCK_EXAMS_DB } from "../constants";
import { TCF_MODULE_ORDER, getModuleLabel } from "../tcfConstants";
import { TEF_MODULE_ORDER, getTefModuleLabel } from "../tefConstants";
import TcfModuleSession from "./tcf/TcfModuleSession";
import TefModuleSession from "./tef/TefModuleSession";
import FullExamReportModal from "./FullExamReportModal";
import AiEvaluatingModal from "./AiEvaluatingModal";
import { buildFullExamReport } from "../utils/fullExamReport";
import {
  anyPendingEvals,
  resolveTcfPendingEvals,
  resolveTefPendingEvals,
} from "../utils/pendingEvaluations";
import { fetchUsageLimits } from "../lib/apiClient";
import UsageLimitModal from "./UsageLimitModal";
import {
  mockExamLimitBlock,
  type UsageLimitBlock,
} from "../utils/usageLimits";

interface ExamsTabProps {
  profile: UserProfile;
  onNavigateToPricing: () => void;
  onSaveMockScore: (
    examId: string,
    name: string,
    scorePct: number,
    cefr: string,
    moduleBreakdown?: TcfMockModuleResult[],
    fullReport?: FullExamReport
  ) => void;
  onSaveModuleScore?: (
    moduleId: TcfModuleId,
    rawScore: number,
    maxScore: number,
    examContext: string
  ) => void;
}

type ModuleResultsMap = Partial<Record<TcfModuleId, TcfModuleCompletionResult>>;
type TefModuleResultsMap = Partial<Record<TefModuleId, TefModuleCompletionResult>>;

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
      const cefrs: Record<string, string | undefined> = {};
      r.result.sections.forEach((s, i) => {
        cefrs[`T${i + 1}`] = s.feedback?.cefrScore;
      });
      return { moduleId, moduleLabel: label, sectionCefr: cefrs };
    }
    const cefrs: Record<string, string | undefined> = {};
    r.result.sections.forEach((s, i) => {
      cefrs[`T${i + 1}`] = s.feedback?.cefrLevel;
    });
    return { moduleId, moduleLabel: label, sectionCefr: cefrs };
  });
}

function buildTefModuleBreakdown(
  results: TefModuleResultsMap
): TefMockModuleResult[] {
  return TEF_MODULE_ORDER.map((moduleId) => {
    const label = getTefModuleLabel(moduleId);
    const r = results[moduleId];
    if (!r) return { moduleId, moduleLabel: label };

    if (r.type === "mcq") {
      const mcq = r.result as McqModuleResult;
      const pct = Math.round((mcq.rawScore / mcq.maxScore) * 100);
      return {
        moduleId,
        moduleLabel: label,
        rawScore: mcq.rawScore,
        maxScore: mcq.maxScore,
        scorePct: pct,
      };
    }
    if (r.type === "writing") {
      const writing = r.result as WritingModuleResult;
      const cefrs: Record<string, string | undefined> = {};
      writing.sections.forEach((s, i) => {
        cefrs[`T${i + 1}`] = s.feedback?.cefrScore;
      });
      return { moduleId, moduleLabel: label, sectionCefr: cefrs };
    }
    const oral = r.result as OralModuleResult;
    const cefrs: Record<string, string | undefined> = {};
    oral.sections.forEach((s, i) => {
      cefrs[`T${i + 1}`] = s.feedback?.cefrLevel;
    });
    return { moduleId, moduleLabel: label, sectionCefr: cefrs };
  });
}

function aggregateScorePct(breakdown: (TcfMockModuleResult | TefMockModuleResult)[]): number {
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
  const [tefModuleResults, setTefModuleResults] = useState<TefModuleResultsMap>({});
  const [fullExamReport, setFullExamReport] = useState<FullExamReport | null>(
    null
  );
  const [aiEvaluating, setAiEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [finishingExam, setFinishingExam] = useState(false);
  const [usageLimitBlock, setUsageLimitBlock] =
    useState<UsageLimitBlock | null>(null);

  const isTefSession = activeSessionExam?.examType === "TEF";

  const handleStartExam = async (exam: (typeof MOCK_EXAMS_DB)[0]) => {
    if (profile.tier === "Free") {
      onNavigateToPricing();
      return;
    }
    if (exam.isMaxOnly && profile.tier !== "Max") {
      onNavigateToPricing();
      return;
    }

    try {
      const limits = await fetchUsageLimits();
      const block = mockExamLimitBlock(limits);
      if (block) {
        setUsageLimitBlock(block);
        return;
      }
    } catch {
      setUsageLimitBlock({
        reason: "monthly_mock_exhausted",
        title: "Could not verify your allowance",
        message:
          "We couldn't check your simulation limit. Please sign in again and retry.",
        showUpgrade: false,
      });
      return;
    }

    setActiveSessionExam(exam);
    setCurrentModuleIndex(0);
    setModuleResults({});
    setTefModuleResults({});
    setFullExamReport(null);
    setAiEvaluating(false);
    setEvalError(null);
    setFinishingExam(false);
  };

  const completeMockWithEvals = async (
    isTef: boolean,
    nextResults: ModuleResultsMap | TefModuleResultsMap
  ) => {
    if (!activeSessionExam) return;

    if (!anyPendingEvals(nextResults)) {
      if (isTef) finishTefMock(nextResults as TefModuleResultsMap);
      else finishTcfMock(nextResults as ModuleResultsMap);
      return;
    }

    setFinishingExam(true);
    setEvalError(null);
    setAiEvaluating(true);
    let failed = false;
    try {
      const merged = isTef
        ? await resolveTefPendingEvals(nextResults as TefModuleResultsMap)
        : await resolveTcfPendingEvals(nextResults as ModuleResultsMap);
      if (isTef) finishTefMock(merged);
      else finishTcfMock(merged);
    } catch (err: unknown) {
      failed = true;
      setEvalError(
        err instanceof Error
          ? err.message
          : "AI evaluation failed. Please try again later."
      );
    } finally {
      setAiEvaluating(false);
      if (!failed) setFinishingExam(false);
    }
  };

  const finishTcfMock = (nextResults: typeof moduleResults) => {
    if (!activeSessionExam) return;

    const report = buildFullExamReport(
      "TCF",
      activeSessionExam.id,
      activeSessionExam.name,
      nextResults
    );
    const breakdown = buildModuleBreakdown(nextResults);

    onSaveMockScore(
      activeSessionExam.id,
      activeSessionExam.name,
      report.comprehensionAggregatePct,
      report.estimatedCefr,
      breakdown,
      report
    );
    setFullExamReport(report);
  };

  const handleTcfModuleComplete = (result: TcfModuleCompletionResult) => {
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
    void completeMockWithEvals(false, nextResults);
  };

  const finishTefMock = (nextResults: typeof tefModuleResults) => {
    if (!activeSessionExam) return;

    const report = buildFullExamReport(
      "TEF",
      activeSessionExam.id,
      activeSessionExam.name,
      nextResults
    );
    const breakdown = buildTefModuleBreakdown(nextResults);

    onSaveMockScore(
      activeSessionExam.id,
      activeSessionExam.name,
      report.comprehensionAggregatePct,
      report.estimatedCefr,
      breakdown as unknown as TcfMockModuleResult[],
      report
    );
    setFullExamReport(report);
  };

  const handleTefModuleComplete = (result: TefModuleCompletionResult) => {
    const moduleId = TEF_MODULE_ORDER[currentModuleIndex];
    const nextResults = { ...tefModuleResults, [moduleId]: result };
    setTefModuleResults(nextResults);

    if (result.type === "mcq" && onSaveModuleScore) {
      const mcq = result.result as McqModuleResult;
      onSaveModuleScore(
        moduleId as unknown as TcfModuleId,
        mcq.rawScore,
        mcq.maxScore,
        activeSessionExam?.name ?? "TEF module"
      );
    }

    if (currentModuleIndex < TEF_MODULE_ORDER.length - 1) {
      setCurrentModuleIndex((i) => i + 1);
      return;
    }
    void completeMockWithEvals(true, nextResults);
  };

  const matchedExams = MOCK_EXAMS_DB.filter(
    (ex) => ex.examType === profile.targetExam
  );

  const activeModuleOrder = isTefSession ? TEF_MODULE_ORDER : TCF_MODULE_ORDER;
  const activeModuleId = activeModuleOrder[currentModuleIndex];
  const getActiveLabel = isTefSession ? getTefModuleLabel : getModuleLabel;

  const isTef = profile.targetExam === "TEF";

  return (
    <div id="exams-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <UsageLimitModal
        open={usageLimitBlock != null}
        block={usageLimitBlock}
        onClose={() => setUsageLimitBlock(null)}
        onUpgrade={onNavigateToPricing}
      />
      <AiEvaluatingModal
        open={aiEvaluating || evalError != null}
        error={evalError}
        onDismissError={() => {
          setEvalError(null);
          setFinishingExam(false);
          setActiveSessionExam(null);
        }}
      />
      <FullExamReportModal
        open={fullExamReport != null}
        report={fullExamReport}
        onClose={() => {
          setFullExamReport(null);
          setActiveSessionExam(null);
        }}
      />
      {!activeSessionExam ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#37352F]">
              Exam Simulations
            </h2>
            <p className="text-xs text-[#7A7A78]">
              {isTef
                ? "Official-format TEF modules: 40+40 MCQs, written A/B, oral A/B (~175 min total)."
                : "Official-format TCF modules: 39+39 MCQs, 3 writing tasks, 3 oral tasks (~167 min total)."}
            </p>
          </div>

          {profile.tier === "Free" && (
            <div className="bg-[#FDF3E7] border border-[#FCE1CA] rounded-xl p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
              <div className="space-y-1">
                <h4 className="font-bold text-[#9A5013] text-sm uppercase tracking-wide">
                  Pro required for full simulations
                </h4>
                <p className="text-xs text-[#9A5013] leading-relaxed max-w-xl">
                  Unlock timed {profile.targetExam} modules with comprehension scoring and AI
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
                        <Play className="w-3 h-3 fill-white" /> Start {exam.examType} mock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : finishingExam ? (
        <div className="py-16 text-center text-xs text-[#7A7A78]">
          Finalizing your mock exam results…
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">{activeSessionExam.name}</span>
            <span className="text-[#7A7A78]">
              Module {currentModuleIndex + 1}/{activeModuleOrder.length}:{" "}
              {getActiveLabel(activeModuleId as any)}
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
            {activeModuleOrder.map((id, idx) => (
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
                {getActiveLabel(id as any)}
              </div>
            ))}
          </div>

          {isTefSession ? (
            <TefModuleSession
              key={activeModuleId}
              moduleId={activeModuleId as TefModuleId}
              examMode
              onAbort={() => setActiveSessionExam(null)}
              onComplete={handleTefModuleComplete}
            />
          ) : (
            <TcfModuleSession
              key={activeModuleId}
              moduleId={activeModuleId as TcfModuleId}
              examType="TCF"
              examMode
              onAbort={() => setActiveSessionExam(null)}
              onComplete={handleTcfModuleComplete}
            />
          )}
        </div>
      )}
    </div>
  );
}
