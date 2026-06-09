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
}

export default function PracticeTab({
  profile,
  onNavigateToPricing,
}: PracticeTabProps) {
  const [activeSkill, setActiveSkill] = useState<SkillType>("reading");
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
      registry.meta.sections?.map((s) => s.label.split("—")[0].trim()) ?? [];
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

  const handleTcfModuleComplete = (result: TcfModuleCompletionResult) => {
    const completedModule = activeTcfModule;
    setActiveTcfModule(null);

    if (
      result.type === "mcq" &&
      completedModule &&
      openMcqResultsIfApplicable("TCF", completedModule, result.result)
    ) {
      return;
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
      if (
        completedModule &&
        openMcqResultsIfApplicable("TEF", completedModule, mcq)
      ) {
        return;
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
          {(["reading", "listening", "speaking", "writing"] as SkillType[]).map((skill) => {
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

      {isTcf ? (
        <div className="bg-[#EBF3FC] border border-[#D2E7F6] rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#1D74B4] tracking-wide">
              Full TCF module
            </p>
            <h3 className="text-sm font-bold text-[#1E3A8A] mt-1">
              {tcfModuleMeta.meta.labelFr}
            </h3>
            <p className="text-xs text-[#3B4C7C] mt-1 max-w-xl">
              {tcfModuleMeta.meta.objective} — {tcfModuleMeta.meta.durationMinutes} min
              {tcfModuleMeta.meta.questionCount
                ? ` · ${tcfModuleMeta.meta.questionCount} questions (+1/0)`
                : tcfModuleMeta.meta.sections
                ? ` · ${tcfModuleMeta.meta.sections.length} tasks`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={startFullModule}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
          >
            Start full module
          </button>
        </div>
      ) : (
        <div className="bg-[#EEEFFC] border border-[#DDE0FA] rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#4A55A2] tracking-wide">
              Full TEF module
            </p>
            <h3 className="text-sm font-bold text-[#3D4A8C] mt-1">
              {tefModuleMeta.meta.labelFr}
            </h3>
            <p className="text-xs text-[#5A6199] mt-1 max-w-xl">
              {tefModuleMeta.meta.objective} — {tefModuleMeta.meta.durationMinutes} min
              {tefModuleMeta.meta.questionCount
                ? ` · ${tefModuleMeta.meta.questionCount} questions (+1/0)`
                : " · Sections A & B"}
            </p>
          </div>
          <button
            type="button"
            onClick={startFullModule}
            className="px-4 py-2 bg-[#4A55A2] hover:bg-[#3D4A8C] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
          >
            Start full module
          </button>
        </div>
      )}
    </div>
  );
}
