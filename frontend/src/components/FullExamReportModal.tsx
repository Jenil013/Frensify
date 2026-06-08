import React, { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Download,
  Headphones,
  Mic,
  PenTool,
  X,
} from "lucide-react";
import type {
  AIWritingCorrection,
  AISpeakingSuggestion,
  FullExamReport,
  FullExamReportModule,
  SkillType,
} from "../types";
import { downloadReportPdf } from "../utils/downloadReportPdf";

interface FullExamReportModalProps {
  open: boolean;
  report: FullExamReport | null;
  onClose: () => void;
}

type ReportTab = "overview" | SkillType;

const TAB_CONFIG: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Award },
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "writing", label: "Writing", icon: PenTool },
  { id: "speaking", label: "Speaking", icon: Mic },
];

function moduleForSkill(
  modules: FullExamReportModule[],
  skill: SkillType
): FullExamReportModule | undefined {
  return modules.find((m) => m.skill === skill);
}

function WritingSectionCard({
  label,
  feedback,
}: {
  label: string;
  feedback: AIWritingCorrection;
}) {
  return (
    <article className="border border-[#E9E9E7] rounded-xl bg-white p-4 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-bold text-[#37352F]">{label}</h4>
        <span className="text-[11px] font-bold uppercase tracking-wide bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] px-2.5 py-1 rounded-full">
          CEFR {feedback.cefrScore}
        </span>
        <span className="text-[11px] text-[#5F5E5B]">{feedback.scoreRange}</span>
      </div>
      <p className="text-xs text-[#37352F] leading-relaxed bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3">
        {feedback.overallFeedback}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(feedback.dimensionScores).map(([key, note]) => (
          <div
            key={key}
            className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-2.5 text-xs"
          >
            <p className="font-bold text-[#7A7A78] capitalize mb-0.5">{key}</p>
            <p className="text-[#37352F] leading-relaxed">{note}</p>
          </div>
        ))}
      </div>
      {feedback.detailedCorrections.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
            Key corrections
          </p>
          {feedback.detailedCorrections.slice(0, 3).map((corr, idx) => (
            <div
              key={idx}
              className="text-xs bg-white border border-[#E9E9E7] rounded-lg p-2.5 space-y-1"
            >
              <p className="text-[#B83E5C] line-through">{corr.original}</p>
              <p className="text-[#2D6A53] font-medium">{corr.corrected}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function SpeakingSectionCard({
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
        <h4 className="text-sm font-bold text-[#37352F]">{label}</h4>
        <span className="text-[11px] font-bold uppercase tracking-wide bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] px-2.5 py-1 rounded-full">
          CEFR {feedback.cefrLevel}
        </span>
      </div>
      {cue && (
        <p className="text-xs text-[#5F5E5B] bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3">
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
    </article>
  );
}

function McqScoreCard({ mod }: { mod: FullExamReportModule }) {
  return (
    <div className="border border-[#E9E9E7] rounded-xl bg-white p-5 shadow-sm space-y-3">
      <h4 className="text-sm font-bold text-[#37352F]">{mod.moduleLabel}</h4>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-extrabold text-[#2D6A53] tabular-nums">
          {mod.rawScore}/{mod.maxScore}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wide bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] px-3 py-1.5 rounded-full">
          CEFR {mod.cefrEstimate ?? "—"}
        </span>
      </div>
      <p className="text-xs text-[#7A7A78]">
        {mod.scorePct}% correct · +1/0 official scoring
      </p>
    </div>
  );
}

function OverviewGrid({ report }: { report: FullExamReport }) {
  const skills: SkillType[] = ["listening", "reading", "writing", "speaking"];
  const icons = { listening: Headphones, reading: BookOpen, writing: PenTool, speaking: Mic };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {skills.map((skill) => {
        const mod = moduleForSkill(report.modules, skill);
        const Icon = icons[skill];
        if (!mod) return null;

        let scoreDisplay = "—";
        let subtext = "Not completed";

        if (mod.type === "mcq" && mod.rawScore != null) {
          scoreDisplay = `${mod.rawScore}/${mod.maxScore}`;
          subtext = `CEFR ${mod.cefrEstimate ?? "—"} · ${mod.scorePct}%`;
        } else if (mod.type === "writing" && mod.writingSections) {
          const levels = mod.writingSections
            .map((s) => s.feedback?.cefrScore)
            .filter(Boolean);
          scoreDisplay = levels.length > 0 ? levels.join(" · ") : "—";
          subtext = `${mod.writingSections.length} task${mod.writingSections.length > 1 ? "s" : ""} evaluated`;
        } else if (mod.type === "oral") {
          scoreDisplay = mod.cefrEstimate ?? "—";
          subtext = `${mod.oralSections?.length ?? 0} oral task${(mod.oralSections?.length ?? 0) > 1 ? "s" : ""}`;
        }

        return (
          <div
            key={skill}
            className="border border-[#E9E9E7] rounded-xl bg-[#FAFAF9] p-4 flex gap-3"
          >
            <div className="p-2 bg-[#EAF5F1] rounded-xl h-fit shrink-0">
              <Icon className="w-4 h-4 text-[#2D6A53]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] capitalize">
                {skill}
              </p>
              <p className="text-lg font-extrabold text-[#2D6A53] mt-0.5 truncate">
                {scoreDisplay}
              </p>
              <p className="text-xs text-[#5F5E5B] mt-0.5">{subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FullExamReportModal({
  open,
  report,
  onClose,
}: FullExamReportModalProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab("overview");
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open || !report) return null;

  const handleDownload = () => {
    setDownloading(true);
    try {
      downloadReportPdf(report);
    } finally {
      setDownloading(false);
    }
  };

  const listening = moduleForSkill(report.modules, "listening");
  const reading = moduleForSkill(report.modules, "reading");
  const writing = moduleForSkill(report.modules, "writing");
  const speaking = moduleForSkill(report.modules, "speaking");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="full-exam-report-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#37352F]/35 backdrop-blur-[3px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl max-h-[94vh] bg-white rounded-2xl shadow-2xl border border-[#E9E9E7] flex flex-col animate-fade-in overflow-hidden">
        <div className="bg-gradient-to-br from-[#EAF5F1] to-white px-6 pt-6 pb-5 border-b border-[#E9E9E7] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#D1EBE1] shrink-0">
                <Award className="w-6 h-6 text-[#2D6A53]" />
              </div>
              <div className="min-w-0">
                <h2
                  id="full-exam-report-title"
                  className="text-lg font-bold text-[#37352F] tracking-tight"
                >
                  {report.examName}
                </h2>
                <p className="text-xs text-[#7A7A78] mt-1">
                  {report.examType} full simulation · {report.date}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-[#2D6A53] tabular-nums">
                    {report.comprehensionAggregatePct}%
                  </span>
                  <span className="text-xs text-[#5F5E5B]">
                    comprehension aggregate
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide bg-white text-[#2D6A53] border border-[#D1EBE1] px-2.5 py-1 rounded-full">
                    Est. {report.estimatedCefr}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7A7A78] hover:bg-white/80 hover:text-[#37352F] transition-colors shrink-0 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 px-4 pt-3 pb-0 shrink-0 overflow-x-auto border-b border-[#E9E9E7] bg-[#FAFAF9]">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === id
                  ? "bg-white text-[#37352F] font-bold border border-b-0 border-[#E9E9E7] -mb-px"
                  : "text-[#7A7A78] hover:text-[#37352F]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1 bg-white">
          {activeTab === "overview" && <OverviewGrid report={report} />}

          {activeTab === "listening" && listening && (
            <McqScoreCard mod={listening} />
          )}

          {activeTab === "reading" && reading && <McqScoreCard mod={reading} />}

          {activeTab === "writing" && writing?.writingSections && (
            <div className="space-y-4">
              {writing.writingSections.map((section, idx) =>
                section.feedback ? (
                  <WritingSectionCard
                    key={section.sectionId}
                    label={
                      writing.sectionLabels?.[idx] ?? `Task ${idx + 1}`
                    }
                    feedback={section.feedback}
                  />
                ) : null
              )}
            </div>
          )}

          {activeTab === "speaking" && speaking?.oralSections && (
            <div className="space-y-4">
              {speaking.cefrEstimate && (
                <div className="flex items-baseline gap-2 pb-2 border-b border-[#E9E9E7]">
                  <span className="text-2xl font-extrabold text-[#2D6A53]">
                    {speaking.cefrEstimate}
                  </span>
                  <span className="text-xs text-[#7A7A78]">overall oral estimate</span>
                </div>
              )}
              {speaking.oralSections.map((section, idx) =>
                section.feedback ? (
                  <SpeakingSectionCard
                    key={section.sectionId}
                    label={
                      speaking.sectionLabels?.[idx] ?? `Task ${idx + 1}`
                    }
                    cue={section.examinerCue}
                    feedback={section.feedback}
                  />
                ) : null
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E9E9E7] shrink-0 flex flex-wrap items-center justify-between gap-3 bg-[#FAFAF9]">
          <p className="text-[10px] text-[#7A7A78] max-w-xs leading-relaxed">
            CEFR levels are study estimates — not official exam scores.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2.5 border border-[#2D6A53] text-[#2D6A53] hover:bg-[#EAF5F1] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? "Preparing…" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#37352F] hover:bg-[#2B2A28] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Back to simulations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
