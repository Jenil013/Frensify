import React, { useState } from "react";
import { BookOpen, Headphones, PenTool, Mic } from "lucide-react";
import {
  UserProfile,
  SkillType,
  TcfModuleCompletionResult,
  TcfModuleId,
  TefModuleCompletionResult,
  TefModuleId,
  McqModuleResult,
  OralModuleResult,
  WritingModuleResult,
} from "../types";
import { TCF_MODULE_REGISTRY } from "../tcfConstants";
import { TEF_MODULE_REGISTRY } from "../tefConstants";
import TcfModuleSession from "./tcf/TcfModuleSession";
import TefModuleSession from "./tef/TefModuleSession";
import McqPracticeResultsModal, {
  type McqPracticeResultsPayload,
} from "./McqPracticeResultsModal";
import SpeakingResultsModal, {
  type SpeakingResultsPayload,
} from "./SpeakingResultsModal";
import { isMcqComprehensionModule } from "../utils/mcqScoring";
import { fetchUsageLimits } from "../lib/apiClient";
import UsageLimitModal from "./UsageLimitModal";
import {
  practiceLimitBlock,
  skillNeedsAiEval,
  type UsageLimitBlock,
} from "../utils/usageLimits";

interface PracticeTabProps {
  profile: UserProfile;
  onNavigateToPricing: () => void;
  onSaveModuleScore?: (
    moduleId: TcfModuleId,
    rawScore: number,
    maxScore: number,
    examContext: string
  ) => void;
}

export default function PracticeTab({
  profile,
  onNavigateToPricing,
  onSaveModuleScore,
}: PracticeTabProps) {
  const [activeSkill, setActiveSkill] = useState<SkillType>("listening");
  const [activeTcfModule, setActiveTcfModule] = useState<TcfModuleId | null>(null);
  const [activeTefModule, setActiveTefModule] = useState<TefModuleId | null>(null);
  const [moduleCompleteMsg, setModuleCompleteMsg] = useState<string | null>(null);
  const [mcqResults, setMcqResults] = useState<McqPracticeResultsPayload | null>(null);
  const [speakingResults, setSpeakingResults] =
    useState<SpeakingResultsPayload | null>(null);
  const [usageLimitBlock, setUsageLimitBlock] =
    useState<UsageLimitBlock | null>(null);

  const skillToTcfModule: Record<SkillType, TcfModuleId> = {
    reading: "comprehension-ecrite",
    listening: "comprehension-orale",
    writing: "expression-ecrite",
    speaking: "expression-orale",
  };

  const skillToTefModule: Record<SkillType, TefModuleId> = {
    listening: "comprehension-orale",
    reading: "comprehension-ecrite",
    writing: "expression-ecrite",
    speaking: "expression-orale",
  };

  const openSpeakingResultsIfApplicable = (
    examType: "TCF" | "TEF",
    moduleId: string | null,
    oral: OralModuleResult
  ) => {
    if (!moduleId || moduleId !== "expression-orale") return;
    const registry =
      examType === "TCF"
        ? TCF_MODULE_REGISTRY[moduleId as TcfModuleId]
        : TEF_MODULE_REGISTRY[moduleId as TefModuleId];
    const sectionLabels =
      registry.meta.sections?.map((s) => s.label.split(":")[0].trim()) ?? [];
    setSpeakingResults({
      examType,
      moduleLabel: registry.meta.labelFr,
      sectionLabels,
      sections: oral.sections,
    });
  };

  const openMcqResultsIfApplicable = (
    examType: "TCF" | "TEF",
    moduleId: string,
    mcq: McqModuleResult
  ): boolean => {
    if (!isMcqComprehensionModule(moduleId)) return false;
    const registry =
      examType === "TCF"
        ? TCF_MODULE_REGISTRY[moduleId as TcfModuleId]
        : TEF_MODULE_REGISTRY[moduleId as TefModuleId];
    setMcqResults({
      examType,
      moduleId,
      moduleLabel: registry.meta.labelFr,
      isListening: moduleId === "comprehension-orale",
      rawScore: mcq.rawScore,
      maxScore: mcq.maxScore,
      answers: mcq.answers,
      questions: mcq.questions,
    });
    return true;
  };

  const saveMcqModuleScore = (
    moduleId: TcfModuleId,
    mcq: McqModuleResult
  ) => {
    onSaveModuleScore?.(moduleId, mcq.rawScore, mcq.maxScore, "practice");
  };

  const handleTcfModuleComplete = (result: TcfModuleCompletionResult) => {
    const completedModule = activeTcfModule;
    setActiveTcfModule(null);

    if (result.type === "mcq" && completedModule) {
      saveMcqModuleScore(completedModule, result.result);
      if (openMcqResultsIfApplicable("TCF", completedModule, result.result)) {
        return;
      }
    }

    if (result.type === "mcq") {
      setModuleCompleteMsg(
        `Module complete: ${result.result.rawScore}/${result.result.maxScore} (+1/0)`
      );
    } else if (result.type === "writing") {
      const tasks = result.result.sections.map(
        (s, i) => `T${i + 1}: ${s.feedback?.cefrScore ?? "—"}`
      );
      setModuleCompleteMsg(`Writing module complete — ${tasks.join(", ")}`);
    } else {
      openSpeakingResultsIfApplicable("TCF", completedModule, result.result);
    }
  };

  const handleTefModuleComplete = (result: TefModuleCompletionResult) => {
    const completedModule = activeTefModule;
    setActiveTefModule(null);

    if (result.type === "mcq") {
      const mcq = result.result as McqModuleResult;
      if (completedModule) {
        saveMcqModuleScore(
          completedModule as unknown as TcfModuleId,
          mcq
        );
        if (openMcqResultsIfApplicable("TEF", completedModule, mcq)) {
          return;
        }
      }
      setModuleCompleteMsg(
        `TEF module complete: ${mcq.rawScore}/${mcq.maxScore} (+1/0)`
      );
    } else if (result.type === "writing") {
      const writing = result.result as WritingModuleResult;
      const a = writing.sections[0]?.feedback?.cefrScore ?? "—";
      const b = writing.sections[1]?.feedback?.cefrScore ?? "—";
      setModuleCompleteMsg(`TEF writing complete — Section A: ${a}, B: ${b}`);
    } else {
      openSpeakingResultsIfApplicable(
        "TEF",
        completedModule,
        result.result as OralModuleResult
      );
    }
  };

  const startFullModule = async () => {
    if (profile.tier === "Free") {
      onNavigateToPricing();
      return;
    }

    if (skillNeedsAiEval(activeSkill)) {
      try {
        const limits = await fetchUsageLimits();
        const block = practiceLimitBlock(limits, activeSkill);
        if (block) {
          setUsageLimitBlock(block);
          return;
        }
      } catch {
        setUsageLimitBlock({
          reason: "weekly_exhausted",
          title: "Could not verify your allowance",
          message:
            "We couldn't check your weekly AI evaluation limit. Please sign in again and retry.",
          showUpgrade: false,
        });
        return;
      }
    }

    setModuleCompleteMsg(null);
    if (profile.targetExam === "TCF") {
      setActiveTcfModule(skillToTcfModule[activeSkill]);
    } else {
      setActiveTefModule(skillToTefModule[activeSkill]);
    }
  };

  if (activeTcfModule) {
    return (
      <div id="practice-tab" className="space-y-4 animate-fade-in text-[#37352F]">
        <TcfModuleSession
          moduleId={activeTcfModule}
          examType={profile.targetExam}
          examMode={false}
          onAbort={() => setActiveTcfModule(null)}
          onComplete={handleTcfModuleComplete}
        />
      </div>
    );
  }

  if (activeTefModule) {
    return (
      <div id="practice-tab" className="space-y-4 animate-fade-in text-[#37352F]">
        <TefModuleSession
          moduleId={activeTefModule}
          examMode={false}
          onAbort={() => setActiveTefModule(null)}
          onComplete={handleTefModuleComplete}
        />
      </div>
    );
  }

  const tcfModuleMeta = TCF_MODULE_REGISTRY[skillToTcfModule[activeSkill]];
  const tefModuleMeta = TEF_MODULE_REGISTRY[skillToTefModule[activeSkill]];
  const isTcf = profile.targetExam === "TCF";
  const moduleMeta = isTcf ? tcfModuleMeta.meta : tefModuleMeta.meta;
  const examLabel = isTcf ? "TCF" : "TEF";

  const skillFlashcard = {
    reading: {
      Icon: BookOpen,
      accent: "border-[#FCE1CA] bg-[#FDF8F3]",
      badge: "bg-[#FDF3E7] text-[#9A5013] border-[#FCE1CA]",
      iconWrap: "bg-[#FDF3E7] text-[#9A5013]",
      button: "bg-[#9A5013] hover:bg-[#7A4010] text-white",
      pill: "bg-white/80 text-[#9A5013] border-[#FCE1CA]",
    },
    listening: {
      Icon: Headphones,
      accent: "border-[#D1EBE1] bg-[#F5FAF8]",
      badge: "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]",
      iconWrap: "bg-[#EAF5F1] text-[#2D6A53]",
      button: "bg-[#2D6A53] hover:bg-[#204E3C] text-white",
      pill: "bg-white/80 text-[#2D6A53] border-[#D1EBE1]",
    },
    speaking: {
      Icon: Mic,
      accent: "border-[#F8D4DE] bg-[#FDF6F8]",
      badge: "bg-[#FCECF0] text-[#B83E5C] border-[#F8D4DE]",
      iconWrap: "bg-[#FCECF0] text-[#B83E5C]",
      button: "bg-[#B83E5C] hover:bg-[#9A3350] text-white",
      pill: "bg-white/80 text-[#B83E5C] border-[#F8D4DE]",
    },
    writing: {
      Icon: PenTool,
      accent: "border-[#D2E7F6] bg-[#F5F9FD]",
      badge: "bg-[#E8F3FC] text-[#1D74B4] border-[#D2E7F6]",
      iconWrap: "bg-[#E8F3FC] text-[#1D74B4]",
      button: "bg-[#1D74B4] hover:bg-[#155A8F] text-white",
      pill: "bg-white/80 text-[#1D74B4] border-[#D2E7F6]",
    },
  }[activeSkill];

  const SkillIcon = skillFlashcard.Icon;

  const formatMeta =
    moduleMeta.questionCount != null
      ? `${moduleMeta.questionCount} questions`
      : moduleMeta.sections
        ? `${moduleMeta.sections.length === 2 ? "Sections A & B" : `${moduleMeta.sections.length} tasks`}`
        : null;

  return (
    <div id="practice-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <UsageLimitModal
        open={usageLimitBlock != null}
        block={usageLimitBlock}
        onClose={() => setUsageLimitBlock(null)}
        onUpgrade={onNavigateToPricing}
      />
      <McqPracticeResultsModal
        open={mcqResults != null}
        payload={mcqResults}
        onClose={() => setMcqResults(null)}
      />
      <SpeakingResultsModal
        open={speakingResults != null}
        payload={speakingResults}
        onClose={() => setSpeakingResults(null)}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#37352F]">Skills Training Center</h2>
          <p className="text-xs text-[#7A7A78]">Train on syllabus questions aligned with CEFR grading grids.</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg">
          {(["listening", "reading", "writing", "speaking"] as SkillType[]).map((skill) => {
            const Icon = {
              reading: BookOpen,
              listening: Headphones,
              speaking: Mic,
              writing: PenTool,
            }[skill];
            return (
              <button
                key={skill}
                type="button"
                onClick={() => setActiveSkill(skill)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                  activeSkill === skill
                    ? "bg-white shadow-sm border border-[#E9E9E7] text-[#37352F] font-semibold"
                    : "text-[#5F5E5B] hover:text-[#37352F]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {moduleCompleteMsg && (
        <div className="bg-[#EAF5F1] border border-[#D1EBE1] rounded-lg p-3 text-xs text-[#2D6A53] font-medium">
          {moduleCompleteMsg}
          <button
            type="button"
            onClick={() => setModuleCompleteMsg(null)}
            className="ml-2 text-[#1D74B4] font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        className={`rounded-2xl border shadow-premium overflow-hidden ${skillFlashcard.accent}`}
      >
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border ${skillFlashcard.badge}`}
            >
              Full {examLabel} module
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${skillFlashcard.iconWrap}`}
            >
              <SkillIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-[#37352F]">
              {moduleMeta.labelFr}
            </h3>
            <p className="text-sm text-[#5F5E5B] leading-relaxed max-w-2xl">
              {moduleMeta.objective}
            </p>
          </div>

          <div className="flex w-full gap-2">
            <span
              className={`flex-1 text-center text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border ${skillFlashcard.pill}`}
            >
              Duration: {moduleMeta.durationMinutes} min
            </span>
            {formatMeta && (
              <span
                className={`flex-1 text-center text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border ${skillFlashcard.pill}`}
              >
                {formatMeta}
              </span>
            )}
            <span
              className={`flex-1 text-center text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border ${skillFlashcard.pill}`}
            >
              Timed practice
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={startFullModule}
          className={`w-full py-3.5 text-sm font-bold tracking-wide transition-colors cursor-pointer ${skillFlashcard.button}`}
        >
          Start Test
        </button>
      </div>
    </div>
  );
}
