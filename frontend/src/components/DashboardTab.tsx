import React from "react";
import { Sparkles, Trophy, Flame, ChevronRight, BookOpen, Headphones, PenTool, Mic, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { UserProfile, ExerciseItem } from "../types";

interface DashboardTabProps {
  profile: UserProfile;
  onNavigate: (tab: string) => void;
  onStartExercise: (exercise: ExerciseItem) => void;
  recommendedExercise: ExerciseItem;
  completedCount: number;
  totalAvailable: number;
}

export default function DashboardTab({
  profile,
  onNavigate,
  onStartExercise,
  recommendedExercise,
  completedCount,
  totalAvailable,
}: DashboardTabProps) {
  // Calculate average score for display
  const averageScore = profile.mockTestScores.length > 0
    ? Math.round(profile.mockTestScores.reduce((acc, curr) => acc + curr.scorePct, 0) / profile.mockTestScores.length)
    : 84;

  const skillData = [
    { name: "Compréhension orale (40 Q)", score: "C1 Elite", pct: 90, tagColor: "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]", barColor: "bg-[#2D6A53]", barBg: "bg-[#EAF5F1]" },
    { name: "Compréhension écrite (40 Q)", score: "B2 Upper", pct: 72, tagColor: "bg-[#FDF3E7] text-[#9A5013] border-[#FCE1CA]", barColor: "bg-[#9A5013]", barBg: "bg-[#FDF3E7]" },
    { name: "Expression écrite (A+B)", score: "C1 Draft", pct: 85, tagColor: "bg-[#E8F3FC] text-[#1D74B4] border-[#D2E7F6]", barColor: "bg-[#1D74B4]", barBg: "bg-[#E8F3FC]" },
    { name: "Expression orale (A+B)", score: "B1 Active", pct: 60, tagColor: "bg-[#FCECF0] text-[#B83E5C] border-[#F8D4DE]", barColor: "bg-[#B83E5C]", barBg: "bg-[#FCECF0]" },
  ];

  return (
    <div id="dashboard-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      
      {/* Recommended Action & Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recommended Action Widget (Attio/Notion Callout style) */}
        <div id="hero-widget" className="lg:col-span-8 bg-[#EBF3FC] rounded-2xl p-6 border border-[#D2E7F6] flex flex-col justify-between min-h-[260px] relative overflow-hidden shadow-premium">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-[#1D74B4] border border-[#CCE2F4] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                RECOMMENDED DAILY SYLLABUS
              </span>
              <span className="bg-[#E4E4E7] text-[#3F3F46] border border-[#D4D4D8] text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                {recommendedExercise.difficulty} MODE
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#1E3A8A]">
              {recommendedExercise.title}
            </h2>
            <p className="text-[#3B4C7C] text-xs leading-relaxed max-w-xl">
              {recommendedExercise.skill === "speaking" 
                ? "TCF oral module: Section A (5 min, obtain info) and Section B (10 min, convince). Practice full 15-minute format."
                : "TCF reading module: 40 MCQs in 60 minutes with +1/0 scoring. Run a full module from Practice or Simulations."}
            </p>
          </div>
          
          <div className="relative z-10 flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-[#1D74B4]/10 mt-4">
            <button
              id="btn-start-recommended"
              onClick={() => onStartExercise(recommendedExercise)}
              className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] active:translate-y-[1px] text-white rounded-lg font-bold transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
            >
              Launch Drill Workspace <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-[11px] text-[#55698B] font-medium">
              <span>⏱️ Timed : {recommendedExercise.durationMinutes} min</span>
              <span>•</span>
              <span className="capitalize">{recommendedExercise.skill} criteria tracker</span>
            </div>
          </div>
          
          {/* Subtle decor representing Notion curves */}
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#D1E6F9]/30 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Readiness Index */}
        <div id="readiness-widget" className="lg:col-span-4 bg-white border border-[#E9E9E7] rounded-2xl p-6 flex flex-col items-center justify-between shadow-premium">
          <div className="text-center w-full pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">ESTIMATED CANADIAN CLB INDEX</span>
            <p className="text-[11px] text-[#7A7A78] mt-0.5">Continuous evaluation database</p>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#F1F1EF"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#10B981"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="327"
                strokeDashoffset={327 - (327 * averageScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tracking-tight text-[#37352F]">{averageScore}%</span>
              <span className="text-[9px] text-[#10B981] font-bold uppercase tracking-widest mt-0.5">READY</span>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-[11px] text-[#5F5E5B] italic leading-normal px-2">
              You are within the C1 band of {profile.targetExam} criteria. Secure consistency over basic auxiliary prepositions.
            </p>
          </div>
        </div>

      </div>

      {/* Attio/Notion dynamic Metric cards */}
      <div id="skills-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {skillData.map((skill) => (
          <div key={skill.name} className="bg-white p-5 rounded-xl border border-[#E9E9E7] shadow-premium hover:border-[#D4D4D2] transition-all">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] font-semibold text-[#7A7A78] uppercase tracking-wide">{skill.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${skill.tagColor}`}>
                {skill.score}
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-xl font-bold text-[#37352F]">{skill.pct}%</span>
              <span className="text-[9px] text-[#A1A1AA] uppercase font-bold">Accuracy</span>
            </div>

            {/* Simple mini bar progress style from Attio chart */}
            <div className={`h-2 w-full ${skill.barBg} rounded overflow-hidden`}>
              <div 
                className={`h-full ${skill.barColor} rounded transition-all duration-1000`} 
                style={{ width: `${skill.pct}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom checklist & simulated history Notion Grid database */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Study list block */}
        <div className="lg:col-span-4 bg-white border border-[#E9E9E7] rounded-2xl p-5 shadow-premium space-y-4">
          <div className="pb-3 border-b border-[#F1F1EF] flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A78]">DAILY ROUTINE CHECKLIST</h3>
              <p className="text-[11px] text-[#9B9A97]">Targeting 30m structured prep</p>
            </div>
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
          </div>

          <div className="space-y-2">
            
            <div className="flex items-start gap-2.5 p-2.5 hover:bg-[#F1F1EF]/30 rounded-lg transition-all border border-transparent">
              <input type="checkbox" checked={completedCount > 0} readOnly className="w-4 h-4 rounded text-[#1A73E8] focus:ring-[#1A73E8] border-[#E9E9E7] accent-[#1A73E8] mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${completedCount > 0 ? "line-through text-[#A1A1AA]" : "text-[#37352F]"}`}>
                  Daily Vocabulary Flip (5 words)
                </p>
                <p className="text-[10px] text-[#7A7A78]">Catalog advanced structures</p>
              </div>
              <span className="text-[9px] bg-[#F1F1EF] text-[#37352F] px-1.5 py-0.5 rounded font-mono shrink-0 font-medium">+2XP</span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 hover:bg-[#F1F1EF]/30 rounded-lg transition-all border border-transparent">
              <input type="checkbox" checked={completedCount > 1} readOnly className="w-4 h-4 rounded text-[#1A73E8] focus:ring-[#1A73E8] border-[#E9E9E7] accent-[#1A73E8] mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${completedCount > 1 ? "line-through text-[#A1A1AA]" : "text-[#37352F]"}`}>
                  Complete Recommended Drill
                </p>
                <p className="text-[10px] text-[#7A7A78] truncate">{recommendedExercise.title}</p>
              </div>
              <span className="text-[9px] bg-[#F1F1EF] text-[#37352F] px-1.5 py-0.5 rounded font-mono shrink-0 font-medium">+10XP</span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 hover:bg-[#F1F1EF]/30 rounded-lg transition-all border border-transparent">
              <input type="checkbox" checked={completedCount > 2} readOnly className="w-4 h-4 rounded text-[#1A73E8] focus:ring-[#1A73E8] border-[#E9E9E7] accent-[#1A73E8] mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${completedCount > 2 ? "line-through text-[#A1A1AA]" : "text-[#37352F]"}`}>
                  Interactive Oral Audits Response
                </p>
                <p className="text-[10px] text-[#7A7A78]">Listen to audio models and retry speaking</p>
              </div>
              <span className="text-[9px] bg-[#F1F1EF] text-[#37352F] px-1.5 py-0.5 rounded font-mono shrink-0 font-medium">+5XP</span>
            </div>

          </div>

          <div className="bg-[#EAF5F1] border border-[#D1EBE1] rounded-xl p-3 flex gap-2 items-start mt-2">
            <Sparkles className="w-4 h-4 text-[#2D6A53] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#2D6A53] leading-relaxed">
              <strong>Grammar Tip:</strong> Double check you employ <em>le participe présent</em> in formal briefs. These syntax models score up to 1.5x higher.
            </p>
          </div>
        </div>

        {/* Real Notion Grid Database Simulation History! */}
        <div className="lg:col-span-8 bg-white border border-[#E9E9E7] rounded-2xl p-5 shadow-premium space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F1F1EF]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A78]">SIMULATION DATABASE INDEX</h3>
              <p className="text-[11px] text-[#9B9A97]">Notion tabular display metadata</p>
            </div>
            <button
              onClick={() => onNavigate("exams")}
              className="text-[11px] font-bold text-[#1A73E8] hover:underline flex items-center gap-1"
            >
              Access Simulator <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Tabular Notion View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E9E9E7] text-[#9B9A97] font-semibold">
                  <th className="py-2 px-3 font-normal">Aa Name</th>
                  <th className="py-2 px-3 font-normal">📅 Date Taken</th>
                  <th className="py-2 px-3 font-normal">🏷️ Pathway</th>
                  <th className="py-2 px-3 font-normal">📊 Rating</th>
                  <th className="py-2 px-3 font-normal text-right">⚙️ Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1EF]">
                {profile.mockTestScores.map((score, idx) => {
                  // Beautiful pastel background mappings based on index to replicate image tags
                  const pathwayPill = profile.targetExam === "TEF" 
                    ? "bg-[#EBF3FC] text-[#1D74B4] border-[#D2E7F6]" 
                    : "bg-[#F1EEF9] text-[#7A5FC1] border-[#E3DDF3]";
                  
                  const scorePill = score.scorePct >= 80 ? "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]" : 
                                    score.scorePct >= 70 ? "bg-[#FDF3E7] text-[#9A5013] border-[#FCE1CA]" : 
                                    "bg-[#FCECF0] text-[#B83E5C] border-[#F8D4DE]";
                  
                  const cefrPill = score.cefr === "C1" ? "bg-[#F1EEF9] text-[#7A5FC1]" : "bg-[#EBF3FC] text-[#1D74B4]";

                  return (
                    <tr key={idx} className="hover:bg-[#FAFAF9] transition-all">
                      <td className="py-3 px-3 font-medium text-[#37352F] max-w-[180px] truncate">
                        {score.examName}
                      </td>
                      <td className="py-3 px-3 text-[#7A7A78] font-mono">
                        {score.date}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border ${pathwayPill}`}>
                          {profile.targetExam}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${scorePill}`}>
                          {score.scorePct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${cefrPill}`}>
                          {score.cefr}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {profile.tier === "Free" && (
            <div className="bg-[#FDF3E7] border border-[#FCE1CA] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#9A5013]">FREE ACCESS LOCK active</p>
                <p className="text-[11px] text-[#9A5013] mt-0.5">Upgrade for persistent metrics logs and live audio coaching response diagnostics.</p>
              </div>
              <button 
                onClick={() => onNavigate("pricing")}
                className="px-3.5 py-1.5 bg-[#9A5013] hover:bg-[#834310] text-white text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer"
              >
                Display Pro Options
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
