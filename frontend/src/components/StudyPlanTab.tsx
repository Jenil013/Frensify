import React, { useState } from "react";
import { Sparkles, Calendar, ClipboardList, CheckSquare, ShieldAlert, Award, ArrowRight, Loader2, Info } from "lucide-react";
import { UserProfile, StudyPlanResponse } from "../types";
import { generateStudyPlan } from "../api";

interface StudyPlanTabProps {
  profile: UserProfile;
  onNavigateToPricing: () => void;
  onUpdateCompletedAction: () => void;
}

export default function StudyPlanTab({
  profile,
  onNavigateToPricing,
  onUpdateCompletedAction,
}: StudyPlanTabProps) {
  // Plan creation parameters
  const [weeksCount, setWeeksCount] = useState(4);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [targetScore, setTargetScore] = useState("CLB 7 (B2)");
  const [selectedProficiency, setSelectedProficiency] = useState("B1");

  // Output study plan data
  const [studyPlanResult, setStudyPlanResult] = useState<StudyPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Active viewing week index
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  // Track checked checkboxes for tasks in the active week
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const handleCreatePlan = async () => {
    // Gate logic
    if (profile.tier === "Free") {
      onNavigateToPricing();
      return;
    }

    setLoadingPlan(true);
    setApiError(null);
    setStudyPlanResult(null);
    try {
      const res = await generateStudyPlan(
        profile.targetExam,
        selectedProficiency,
        targetScore,
        dailyMinutes,
        weeksCount
      );
      setStudyPlanResult(res);
      setActiveWeekIndex(0);
      setCheckedTasks({});
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to generate study plan. Check your keys or servers.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const toggleTask = (dayKey: string) => {
    const taskKey = `week-${activeWeekIndex}-${dayKey}`;
    const wasChecked = !!checkedTasks[taskKey];
    setCheckedTasks(prev => ({
      ...prev,
      [taskKey]: !wasChecked
    }));

    if (!wasChecked) {
      onUpdateCompletedAction(); // triggers xp and progress incrementation
    }
  };

  return (
    <div id="study-plan-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#37352F]">AI Study Plans</h2>
        <p className="text-xs text-[#7A7A78]">Calibrate customized study milestones modeled on your current CEFR diagnostics.</p>
      </div>

      {profile.tier === "Free" ? (
        /* Plan Gate warning for Free Tier (Pro Callout) */
        <div className="bg-white border border-[#E9E9E7] rounded-xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-premium">
          <Calendar className="w-10 h-10 text-[#7B7B79] mx-auto opacity-80" />
          <div className="space-y-1.5">
            <h3 className="text-[#37352F] text-base font-bold uppercase tracking-wide">Study Plan Generator is Locked</h3>
            <p className="text-xs text-[#7A7A78] leading-relaxed px-4">
              Don't guess what topic to focus on next. Our AI Engine designs customized week-by-week syllabus objectives, prioritizes speaking connectors, and structures realistic timelines.
            </p>
          </div>
          <button
            onClick={onNavigateToPricing}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-lg transition-all inline-block cursor-pointer shadow-sm"
          >
            Unlock Study Architect
          </button>
        </div>
      ) : (
        /* Study Architect setup & output workspace */
        <div className="space-y-6">
          <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#7A7A78]">Plan Configuration Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block mb-1.5">Current CEFR Rank</label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E9E9E7] rounded-lg text-xs font-bold bg-[#FAFAF9] text-[#37352F] outline-none cursor-pointer focus:bg-white"
                >
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                  <option value="C1">C1 (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block mb-1.5">Immigration Target</label>
                <select
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E9E9E7] rounded-lg text-xs font-bold bg-[#FAFAF9] text-[#37352F] outline-none cursor-pointer focus:bg-white"
                >
                  <option value="CLB 5 (A2/B1 equivalent)">CLB 5 (Moderate)</option>
                  <option value="CLB 7 (B2 equivalent)">CLB 7 (Trilingual Route)</option>
                  <option value="CLB 9 (C1 equivalent)">CLB 9 (Express Entry Max)</option>
                  <option value="CLB 10 (C2 equivalent)">CLB 10 (Mastery)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block mb-1.5">Syllabus Span</label>
                <select
                  value={weeksCount}
                  onChange={(e) => setWeeksCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#E9E9E7] rounded-lg text-xs font-bold bg-[#FAFAF9] text-[#37352F] outline-none cursor-pointer focus:bg-white"
                >
                  <option value={2}>2 Weeks Blitz</option>
                  <option value={4}>4 Weeks Focused</option>
                  <option value={8}>8 Weeks Extended</option>
                  <option value={12}>12 Weeks Ascent Route</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block mb-1.5">Daily Intensity</label>
                <select
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#E9E9E7] rounded-lg text-xs font-bold bg-[#FAFAF9] text-[#37352F] outline-none cursor-pointer focus:bg-white"
                >
                  <option value={15}>15 Minutes (Stretching)</option>
                  <option value={30}>30 Minutes (Sustained)</option>
                  <option value={45}>45 Minutes (Grind)</option>
                  <option value={60}>60 Minutes (High Impact)</option>
                </select>
              </div>

            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#FAFAF9] -mx-5 -mb-5 p-4 rounded-b-xl border-t border-[#E9E9E7] gap-3">
              <span className="text-[11px] text-[#7A7A78] font-mono">Customizes daily calendar modules inside your diagnostic trends</span>
              <button
                id="btn-generate-study-plan"
                onClick={handleCreatePlan}
                disabled={loadingPlan}
                className="px-4 py-2 bg-[#37352F] hover:bg-black disabled:bg-[#F1F1EF] disabled:text-[#A1A1AA] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {loadingPlan ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Assembly...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Assemble AI Plan Now
                  </>
                )}
              </button>
            </div>
          </div>

          {studyPlanResult && (
            <div id="study-plan-output-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Left hand side week switches & tactical guides */}
              <div className="lg:col-span-4 space-y-4">
                
                <div className="bg-white border border-[#E9E9E7] rounded-xl p-4 shadow-premium space-y-2.5">
                  <span className="text-[10px] font-bold text-[#7A7A78] uppercase tracking-wider block">Plan Timelines</span>
                  <div className="space-y-1">
                    {studyPlanResult.weeklyBreakdown.map((wk, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveWeekIndex(idx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all flex justify-between items-center cursor-pointer ${
                          activeWeekIndex === idx 
                            ? "bg-[#EAF5F1] border-[#D1EBE1] text-[#2D6A53]" 
                            : "bg-[#FAFAF9] border-[#E9E9E7] hover:bg-white text-[#5F5E5B]"
                        }`}
                      >
                        <span>Week {wk.weekNumber}: Focus Set</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#E9E9E7] rounded-xl p-4 shadow-premium space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#37352F] uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-[#2D6A53]" />
                    <span>Focus node priorities</span>
                  </div>
                  <ul className="space-y-1.5 pl-0">
                    {studyPlanResult.prioritySkillsToBuild.map((skill, idx) => (
                      <li key={idx} className="text-xs text-[#5F5E5B] flex gap-2 items-start leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-[#2D6A53] rounded-full mt-1.5 shrink-0"></span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#EEEFFC] border border-[#DDE0FA] rounded-xl p-4 text-xs text-[#4A55A2] space-y-1.5 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <Info className="w-3.5 h-3.5 text-[#4A55A2]" />
                    <p className="font-bold uppercase text-[10px] tracking-wide">Examiner Advisory Note:</p>
                  </div>
                  <p className="leading-relaxed italic">
                    {studyPlanResult.expertAdvice}
                  </p>
                </div>

              </div>

              {/* Right hand side: interactive calendar tasks */}
              <div className="lg:col-span-8 bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-[#F1F1EF]">
                    <div>
                      <span className="text-[9px] bg-[#EEEFFC] text-[#4A55A2] px-2 py-0.5 rounded uppercase font-bold">
                        Week {studyPlanResult.weeklyBreakdown[activeWeekIndex].weekNumber} Syllabus
                      </span>
                      <h4 className="text-base font-bold text-[#37352F] mt-1.5">
                        {studyPlanResult.weeklyBreakdown[activeWeekIndex].theme}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-[#5F5E5B] leading-relaxed italic bg-[#FAFAF9] p-3.5 border border-[#E9E9E7] rounded-lg mt-3">
                    <strong>Weekly target goal:</strong> {studyPlanResult.weeklyBreakdown[activeWeekIndex].mainGoal}
                  </p>

                  <div className="mt-4 space-y-2">
                    {Object.entries(studyPlanResult.weeklyBreakdown[activeWeekIndex].dailyTasks).map(([day, description]) => {
                      const taskKey = `week-${activeWeekIndex}-${day}`;
                      const isDone = !!checkedTasks[taskKey];
                      return (
                        <div 
                          key={day} 
                          className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all ${
                            isDone ? "bg-[#EAF5F1]/30 border-[#D1EBE1]" : "bg-white border-[#E9E9E7]/60 hover:bg-[#FAFAF9]"
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isDone}
                            onChange={() => toggleTask(day)}
                            className="w-4 h-4 rounded text-[#2D6A53] focus:ring-[#2D6A53] border-[#E9E9E7] accent-[#2D6A53] mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1 text-xs">
                            <span className="font-bold text-[#37352F] block">{day}</span>
                            <p className={`mt-0.5 ${isDone ? "line-through text-[#9B9A97]" : "text-[#5F5E5B]"} leading-relaxed`}>
                              {description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#FAFAF9] p-3 rounded-lg border border-[#E9E9E7] text-xs text-[#7B7B79] leading-relaxed mt-4">
                  <strong>💡 Pro Study Tip:</strong> {studyPlanResult.weeklyBreakdown[activeWeekIndex].tips}
                </div>

              </div>

            </div>
          )}

          {apiError && (
            <div className="bg-[#FCECF0] border border-[#F8D4DE] text-xs p-3.5 rounded-lg text-[#B83E5C] flex gap-2 items-center max-w-xl mx-auto">
              <ShieldAlert className="w-4.5 h-4.5 text-[#B83E5C]" />
              <p>{apiError}</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
