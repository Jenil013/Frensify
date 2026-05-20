import React from "react";
import { BarChart, Compass, Sparkles } from "lucide-react";
import { UserProfile } from "../types";
import { getModuleLabel } from "../tcfConstants";
import {
  parseCefrTarget,
  getTefTargetLabel,
  cefrProgressPercent,
  TEF_CEFR_SKILL_TARGETS,
  TEF_SKILLS,
  getSkillLabel,
  CefrLevel,
} from "../tefConstants";
import TefGradingScheme from "./tef/TefGradingScheme";

interface AnalyticsTabProps {
  profile: UserProfile;
  completedCount: number;
}

export default function AnalyticsTab({
  profile,
  completedCount,
}: AnalyticsTabProps) {
  const averageAccuracy = profile.mockTestScores.length > 0
    ? Math.round(profile.mockTestScores.reduce((acc, curr) => acc + curr.scorePct, 0) / profile.mockTestScores.length)
    : 81;

  const currentLevelLabel = parseCefrTarget(profile.currentLevel) as CefrLevel;
  const targetLevelLabel = parseCefrTarget(profile.targetScore);
  const trajectoryPct = cefrProgressPercent(currentLevelLabel, targetLevelLabel);
  const skillTargets = TEF_CEFR_SKILL_TARGETS[targetLevelLabel];
  const isTef = profile.targetExam === "TEF";

  return (
    <div id="analytics-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#37352F]">Performance Analytics Dashboard</h2>
        <p className="text-xs text-[#7A7A78]">Trace structural diagnostic curves and vocabulary acquisition velocities.</p>
      </div>

      {profile.tier === "Free" ? (
        /* Free Tier billing block */
        <div className="bg-white border border-[#E9E9E7] rounded-xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-premium animate-fade-in">
          <BarChart className="w-10 h-10 text-[#7B7B79] mx-auto opacity-80" />
          <div className="space-y-1.5">
            <h3 className="text-[#37352F] text-base font-bold uppercase tracking-wide">Detailed Performance Analytics are Locked</h3>
            <p className="text-xs text-[#7A7A78] leading-relaxed px-4">
              Unlock access to map historical grammar diagnostic graphs, target persistent error nodes, and evaluate timeline readiness score forecasts.
            </p>
          </div>
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-[#37352F] hover:bg-black text-white text-xs font-bold rounded-lg transition-all inline-block cursor-pointer shadow-sm"
          >
            Upgrade Tier to Active Analytics
          </button>
        </div>
      ) : (
        /* Analytics Interactive Screen */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium">
              <span className="text-[10px] font-bold uppercase text-[#7A7A78] block mb-1">Interactive drills taken</span>
              <p className="text-2xl font-bold text-[#37352F]">{completedCount + 4}</p>
              <p className="text-[11px] text-[#2D6A53] mt-1 font-mono">🌿 Consistency status: Stable</p>
            </div>
            
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium">
              <span className="text-[10px] font-bold uppercase text-[#7A7A78] block mb-1">Average Sim accuracy</span>
              <p className="text-2xl font-bold text-[#37352F]">{averageAccuracy}%</p>
              <p className="text-[11px] text-[#2D6A53] mt-1 font-mono">🚀 +4% rise since diagnostic week</p>
            </div>

            <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium">
              <span className="text-[10px] font-bold uppercase text-[#7A7A78] block mb-1">Active Study Streak</span>
              <p className="text-2xl font-bold text-[#9A5013]">{profile.streakDays} Days 🔥</p>
              <p className="text-[11px] text-[#7A7A78] mt-1 font-mono">Daily prep habit preserved</p>
            </div>
          </div>

          {(profile.moduleScores?.length ?? 0) > 0 && (
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium">
              <h3 className="text-xs font-bold uppercase text-[#7A7A78] mb-3">
                Recent TCF module scores (+1/0 comprehension)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {profile.moduleScores!.slice(0, 4).map((m, i) => (
                  <div
                    key={`${m.moduleId}-${m.date}-${i}`}
                    className="text-xs border rounded-lg p-2.5 bg-[#FAFAF9]"
                  >
                    <span className="font-bold">{getModuleLabel(m.moduleId)}</span>
                    <p className="text-[#2D6A53] font-mono mt-0.5">
                      {m.rawScore}/{m.maxScore}
                    </p>
                    <p className="text-[10px] text-[#9B9A97]">{m.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Advice panel */}
            <div className="lg:col-span-8 bg-white border border-[#E9E9E7] rounded-xl p-5 md:p-6 shadow-premium space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A78] pb-1 border-b border-[#F1F1EF]">AI Diagnostic Report Remarks</h3>
              
              <div className="space-y-3.5">
                <div className="bg-[#EAF5F1] border border-[#D1EBE1] rounded-lg p-3.5 flex gap-3 items-start">
                  <Sparkles className="w-4 h-4 text-[#2D6A53] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#2D6A53]">Primary Skill Strengths: Compréhension écrite</p>
                    <p className="text-[#37352F] leading-relaxed">
                      Track performance on the official 40-question / 60-minute reading module (+1/0). Scores appear here after each full module or mock simulation.
                    </p>
                  </div>
                </div>

                <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3.5 flex gap-3 items-start">
                  <Compass className="w-4 h-4 text-[#7A7A78] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#37352F]">Remediation target: Spoken Fluency (Oral Section B)</p>
                    <p className="text-[#5F5E5B] leading-relaxed">
                      Subtle pronunciation trends on vowel openings and plural silent endings require slight refinement. Focus on complex relative pronouns like "dont" or "auquel" to confidently secure C1 status indicators.
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress trajectory */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7A78] tracking-wider block">CEFR Calibration Progression Trajectory</span>
                <div className="bg-[#FAFAF9] p-4 rounded-lg border border-[#E9E9E7] space-y-3 font-mono text-[11px]">
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7A7A78]">Week 1 (Diagnostic Baseline)</span>
                      <span className="font-bold">{currentLevelLabel}</span>
                    </div>
                    <div className="h-2 w-full bg-[#E9E9E7] rounded-full">
                      <div className="h-full bg-[#7B7B79] w-[40%] rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7A7A78]">Week 2 (Active Vocabulary Drills)</span>
                      <span className="font-bold">B1</span>
                    </div>
                    <div className="h-2 w-full bg-[#E9E9E7] rounded-full">
                      <div className="h-full bg-[#9A5013] w-[65%] rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7A7A78]">Week 3 (Adaptive Simulation Active)</span>
                      <span className="font-bold">B2</span>
                    </div>
                    <div className="h-2 w-full bg-[#E9E9E7] rounded-full">
                      <div className="h-full bg-[#2D6A53] w-[80%] rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[#1D74B4]">
                      <span className="font-bold">Target milestone ({getTefTargetLabel(targetLevelLabel)})</span>
                      <span className="font-bold">{targetLevelLabel}</span>
                    </div>
                    <div className="h-2 w-full bg-[#E9E9E7] rounded-full">
                      <div
                        className="h-full bg-[#1A73E8] rounded-full transition-all"
                        style={{ width: `${Math.min(trajectoryPct, 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-[#7A7A78]">
                      {trajectoryPct}% of CEFR span from {currentLevelLabel} → {targetLevelLabel}
                    </p>
                  </div>

                </div>
              </div>

            </div>

            <div className="lg:col-span-4 bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block">CEFR Proficiency Index Target</span>
                <div className="p-4 bg-[#FAFAF9] rounded-lg border border-[#E9E9E7] text-center">
                  <p className="text-[10px] uppercase font-bold text-[#7A7A78] tracking-widest mb-1">Target level goal</p>
                  <p className="text-3xl font-extrabold text-[#37352F]">{targetLevelLabel}</p>
                  <p className="text-[10px] text-[#7A7A78] mt-1">{getTefTargetLabel(targetLevelLabel)}</p>
                </div>

                {isTef ? (
                  <div className="space-y-2 text-xs text-[#5F5E5B] leading-relaxed">
                    <p className="font-bold text-[#37352F]">
                      TEF Canada score floors for {targetLevelLabel}:
                    </p>
                    <ul className="space-y-1.5">
                      {TEF_SKILLS.map((skill) => (
                        <li
                          key={skill.id}
                          className="flex justify-between items-center border border-[#E9E9E7] rounded-md px-2 py-1.5 bg-[#FAFAF9]"
                        >
                          <span className="text-[10px] truncate pr-1">
                            {getSkillLabel(skill.id)}
                          </span>
                          <span className="font-mono font-bold text-[#1D74B4] shrink-0">
                            ≥{skillTargets[skill.id].scoreMin}
                            <span className="text-[#2D6A53] text-[9px] ml-1">
                              NCLC{skillTargets[skill.id].nclc}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-[#5F5E5B] leading-relaxed">
                    <p className="font-bold text-[#37352F]">Requirements to reach {targetLevelLabel}:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Synthesize technical transcripts smoothly</li>
                      <li>Sustain spontaneous argumentation for 4 min</li>
                      <li>Compose nuanced written layouts</li>
                      <li>Avoid subjunctif mood agreement errors</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-[#EEEFFC] p-4 rounded-lg border border-[#DDE0FA]">
                <p className="text-[10px] uppercase font-bold text-[#4A55A2] mb-1">Canada Immigration Equivalent</p>
                <p className="text-xs text-[#5C649E] leading-relaxed">
                  {targetLevelLabel === "B2" || targetLevelLabel === "C1" || targetLevelLabel === "C2"
                    ? `${targetLevelLabel} on TEF Canada unlocks NCLC 7+ and up to +50 CRS French bonus on Express Entry.`
                    : `Raise your target to B2+ for Express Entry French language points (NCLC 7).`}
                </p>
              </div>

            </div>
          </div>

          {isTef && (
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 md:p-6 shadow-premium">
              <TefGradingScheme highlightLevel={targetLevelLabel} compact />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
