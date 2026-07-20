import React, { useState, useEffect, useMemo } from "react";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { UserProfile } from "../types";
import {
  fetchRecentTests,
  fetchModuleAccuracy,
  type ModuleAccuracyEntry,
  type RecentTestItem,
} from "../lib/apiClient";
import RecentTestsTable from "./RecentTestsTable";
import RecentTestsModal from "./RecentTestsModal";
import { TCF_MODULE_REGISTRY } from "../tcfConstants";
import {
  TEF_MODULE_REGISTRY,
  cefrProgressPercent,
  parseCefrTarget,
  type CefrLevel,
} from "../tefConstants";
import {
  DASHBOARD_MODULE_ORDER,
  countModulesAtTarget,
  getWeakestModule,
} from "../lib/learningInsights";

const RECENT_TESTS_PREVIEW_LIMIT = 10;
const RECENT_TESTS_ALL_LIMIT = 500;

const MODULE_ORDER = DASHBOARD_MODULE_ORDER;

type ModuleKey = (typeof MODULE_ORDER)[number];

const SKILL_STYLE: Record<ModuleKey, {
  badgeClass: string;
  barFrom: string;
  barTo: string;
  glow: string;
}> = {
  "comprehension-orale": {
    badgeClass: "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]",
    barFrom: "#2D6A53", barTo: "#4CAF82",
    glow: "rgba(45,106,83,0.35)",
  },
  "comprehension-ecrite": {
    badgeClass: "bg-[#FDF3E7] text-[#9A5013] border-[#FCE1CA]",
    barFrom: "#9A5013", barTo: "#D4873C",
    glow: "rgba(154,80,19,0.35)",
  },
  "expression-ecrite": {
    badgeClass: "bg-[#E8F3FC] text-[#1D74B4] border-[#D2E7F6]",
    barFrom: "#1D74B4", barTo: "#4AAEE0",
    glow: "rgba(29,116,180,0.35)",
  },
  "expression-orale": {
    badgeClass: "bg-[#FCECF0] text-[#B83E5C] border-[#F8D4DE]",
    barFrom: "#B83E5C", barTo: "#E07090",
    glow: "rgba(184,62,92,0.35)",
  },
};

const CEFR_BADGE: Record<string, string> = {
  A1: "bg-[#F1F1EF] text-[#5F5E5B] border-[#E9E9E7]",
  A2: "bg-[#F1F1EF] text-[#5F5E5B] border-[#E9E9E7]",
  B1: "bg-[#FCECF0] text-[#B83E5C] border-[#F8D4DE]",
  B2: "bg-[#FDF3E7] text-[#9A5013] border-[#FCE1CA]",
  C1: "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]",
  C2: "bg-[#E8F3FC] text-[#1D74B4] border-[#D2E7F6]",
};

type RegistryMeta = {
  labelFr: string;
  format: string;
  questionCount?: number;
  objective: string;
  sections?: { id: string }[];
};

function getModuleSuffix(meta: RegistryMeta): string {
  if (meta.format === "mcq") return `(${meta.questionCount} Q)`;
  const count = meta.sections?.length ?? 0;
  return count === 2 ? "(A+B)" : `(${count} tâches)`;
}

function moduleLabels(
  registry: Record<string, { meta: RegistryMeta }>
): Record<string, string> {
  return Object.fromEntries(
    MODULE_ORDER.map((id) => [
      id,
      `${registry[id].meta.labelFr} ${getModuleSuffix(registry[id].meta)}`,
    ])
  );
}

interface DashboardFocusCardProps {
  loading: boolean;
  focus: ReturnType<typeof getWeakestModule>;
  badgeClass: string;
  onPractice: () => void;
}

function DashboardFocusCard({
  loading,
  focus,
  badgeClass,
  onPractice,
}: DashboardFocusCardProps) {
  return (
    <div
      id="focus-widget"
      className="lg:col-span-8 bg-white border border-[#E9E9E7] rounded-2xl p-6 flex flex-col justify-between min-h-[260px] shadow-premium"
    >
      <div className="space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
          Today&apos;s focus
        </span>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#37352F]">
            {loading ? "…" : focus.label}
          </h2>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${badgeClass}`}
          >
            {loading ? "…" : focus.cefr}
          </span>
        </div>
        <p className="text-xs text-[#5F5E5B] leading-relaxed max-w-xl">
          {loading ? "Loading your practice insights…" : focus.insight}
        </p>
        {!loading && focus.hasData && (
          <p className="text-[11px] text-[#7A7A78]">
            Recent accuracy estimate:{" "}
            <span className="font-semibold text-[#37352F]">{focus.pct}%</span>
            <span className="text-[#B0B0AE]"> · based on your last sessions</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-[#F1F1EF] mt-4">
        <button
          type="button"
          id="btn-practice-focus"
          onClick={onPractice}
          className="px-4 py-2 bg-[#2D6A53] hover:bg-[#204E3C] text-white rounded-lg font-bold transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
        >
          Practice this module <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-[#7A7A78]">
          {profilePathHint(focus.moduleId)}
        </span>
      </div>
    </div>
  );
}

function profilePathHint(moduleId: ModuleKey): string {
  if (moduleId === "comprehension-orale" || moduleId === "comprehension-ecrite") {
    return "Timed MCQ · +1/0 scoring";
  }
  return "AI-evaluated · exam rubric";
}

interface DashboardPathCardProps {
  loading: boolean;
  targetLabel: CefrLevel;
  currentLabel: CefrLevel;
  trajectoryPct: number;
  modulesAtTarget: number;
  totalModules: number;
}

function DashboardPathCard({
  loading,
  targetLabel,
  currentLabel,
  trajectoryPct,
  modulesAtTarget,
  totalModules,
}: DashboardPathCardProps) {
  return (
    <div
      id="path-widget"
      className="lg:col-span-4 bg-white border border-[#E9E9E7] rounded-2xl p-6 flex flex-col gap-5 shadow-premium"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
          Path to {targetLabel}
        </span>
        <p className="text-[11px] text-[#9B9A97]">
          From {currentLabel} toward your target band
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] mb-2">
            <span>Level trajectory</span>
            <span className="text-[#37352F]">
              {loading ? "…" : `${trajectoryPct}%`}
            </span>
          </div>
          <div className="h-2 w-full bg-[#F1F1EF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D6A53] rounded-full transition-all duration-700 ease-out"
              style={{ width: loading ? "0%" : `${trajectoryPct}%` }}
            />
          </div>
          <p className="text-[10px] text-[#9B9A97] mt-1.5">
            Estimate from your stated current and target levels, not a guarantee.
          </p>
        </div>

        <p className="text-xs text-[#5F5E5B]">
          <span className="font-semibold text-[#37352F]">
            {loading ? "…" : `${modulesAtTarget} of ${totalModules}`}
          </span>{" "}
          modules at or above {targetLabel}
        </p>
      </div>
    </div>
  );
}

interface DashboardTabProps {
  profile: UserProfile;
  onNavigate: (tab: string) => void;
}

export default function DashboardTab({
  profile,
  onNavigate,
}: DashboardTabProps) {
  const [animated, setAnimated] = useState(false);
  const [recentTests, setRecentTests] = useState<RecentTestItem[]>([]);
  const [recentTestsLoading, setRecentTestsLoading] = useState(true);
  const [allRecentTests, setAllRecentTests] = useState<RecentTestItem[]>([]);
  const [allRecentTestsLoading, setAllRecentTestsLoading] = useState(false);
  const [recentTestsModalOpen, setRecentTestsModalOpen] = useState(false);
  const [moduleAccuracy, setModuleAccuracy] = useState<
    Record<string, ModuleAccuracyEntry> | null
  >(null);
  const [accuracyLoading, setAccuracyLoading] = useState(true);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, [profile.targetExam]);

  useEffect(() => {
    setRecentTestsLoading(true);
    void fetchRecentTests(RECENT_TESTS_PREVIEW_LIMIT)
      .then(setRecentTests)
      .catch(() => setRecentTests([]))
      .finally(() => setRecentTestsLoading(false));
  }, [profile.targetExam]);

  const openRecentTestsModal = () => {
    setRecentTestsModalOpen(true);
    setAllRecentTestsLoading(true);
    void fetchRecentTests(RECENT_TESTS_ALL_LIMIT)
      .then(setAllRecentTests)
      .catch(() => setAllRecentTests([]))
      .finally(() => setAllRecentTestsLoading(false));
  };

  useEffect(() => {
    setAccuracyLoading(true);
    void fetchModuleAccuracy(profile.targetExam)
      .then(setModuleAccuracy)
      .catch(() => setModuleAccuracy(null))
      .finally(() => setAccuracyLoading(false));
  }, [profile.targetExam]);

  const registry = (
    profile.targetExam === "TEF" ? TEF_MODULE_REGISTRY : TCF_MODULE_REGISTRY
  ) as Record<string, { meta: RegistryMeta }>;

  const labels = useMemo(
    () =>
      moduleLabels(
        (profile.targetExam === "TEF"
          ? TEF_MODULE_REGISTRY
          : TCF_MODULE_REGISTRY) as Record<string, { meta: RegistryMeta }>
      ),
    [profile.targetExam]
  );

  const targetLabel = parseCefrTarget(profile.targetScore);
  const currentLabel = parseCefrTarget(profile.currentLevel);
  const trajectoryPct = cefrProgressPercent(currentLabel, targetLabel);

  const focus = useMemo(
    () => getWeakestModule(moduleAccuracy, labels, profile.targetScore),
    [moduleAccuracy, labels, profile.targetScore]
  );

  const modulesAtTarget = useMemo(
    () => countModulesAtTarget(moduleAccuracy, profile.targetScore),
    [moduleAccuracy, profile.targetScore]
  );

  const focusBadgeClass =
    CEFR_BADGE[focus.cefr] ?? SKILL_STYLE[focus.moduleId].badgeClass;

  const skillData = MODULE_ORDER.map((id) => {
    const mod = registry[id];
    const style = SKILL_STYLE[id];
    const accuracy = moduleAccuracy?.[id];
    const pct = accuracy?.hasData ? (accuracy.accuracyPct ?? 0) : 0;
    const cefr = accuracy?.hasData ? (accuracy.cefr ?? "A1") : "A1";
    const badgeClass = CEFR_BADGE[cefr] ?? style.badgeClass;
    return {
      id,
      name: labels[id],
      description: mod.meta.objective,
      cefr,
      pct,
      badgeClass,
      barFrom: style.barFrom,
      barTo: style.barTo,
      glow: style.glow,
    };
  });

  return (
    <div id="dashboard-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <RecentTestsModal
        open={recentTestsModalOpen}
        onClose={() => setRecentTestsModalOpen(false)}
        tests={allRecentTests}
        loading={allRecentTestsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">
        <DashboardFocusCard
          loading={accuracyLoading}
          focus={focus}
          badgeClass={focusBadgeClass}
          onPractice={() => onNavigate("practice")}
        />
        <DashboardPathCard
          loading={accuracyLoading}
          targetLabel={targetLabel}
          currentLabel={currentLabel}
          trajectoryPct={trajectoryPct}
          modulesAtTarget={modulesAtTarget}
          totalModules={MODULE_ORDER.length}
        />
      </div>

      {/* Module skill cards — dynamic TEF/TCF */}
      <div id="skills-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {skillData.map((skill) => (
          <div
            key={skill.id}
            className="skill-card bg-white p-5 rounded-2xl border border-[#E9E9E7] shadow-premium hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(15,15,15,0.10),0_12px_40px_rgba(15,15,15,0.05)] hover:border-[#D4D4D2] transition-all duration-200 cursor-default"
          >
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-[#37352F] uppercase tracking-[0.07em] leading-snug">
                {skill.name}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${skill.badgeClass}`}>
                {accuracyLoading ? "…" : skill.cefr}
              </span>
            </div>

            <p className="text-[10px] text-[#9B9A97] leading-relaxed mb-3 line-clamp-2">
              {skill.description}
            </p>

            <div className="flex items-baseline gap-1.5 mb-2.5">
              <span className="text-2xl font-extrabold text-[#37352F] leading-none">
                {accuracyLoading ? "…" : `${skill.pct}%`}
              </span>
              <span className="text-[9px] text-[#B0B0AE] uppercase font-bold tracking-wide">
                Accuracy
              </span>
            </div>

            <div className="h-[7px] w-full bg-[#F1F1EF] rounded-full overflow-hidden">
              <div
                className="skill-bar-fill h-full rounded-full transition-all duration-[900ms] ease-out"
                style={{
                  width: animated ? `${skill.pct}%` : "0%",
                  background: `linear-gradient(90deg, ${skill.barFrom} 0%, ${skill.barTo} 100%)`,
                  boxShadow: `0 0 8px ${skill.glow}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent tests */}
      <div className="bg-white border border-[#E9E9E7] rounded-2xl p-5 shadow-premium space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#F1F1EF]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A78]">
              Recent Tests
            </h3>
            <p className="text-[11px] text-[#9B9A97]">
              Mock simulations and practice sessions
            </p>
          </div>
          {recentTests.length >= RECENT_TESTS_PREVIEW_LIMIT && (
            <button
              type="button"
              onClick={openRecentTestsModal}
              className="text-[11px] font-bold text-[#1A73E8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <RecentTestsTable tests={recentTests} loading={recentTestsLoading} />
      </div>

    </div>
  );
}
