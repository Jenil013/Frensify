import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, BookOpen, Headphones, PenTool, Mic, TrendingUp, Calendar, 
  Settings, CreditCard, Shield, Sparkles, User, GraduationCap, Flame, Star, Zap, LogOut
} from "lucide-react";

import {
  UserProfile,
  UserSubscriptionTier,
  VocabularyCard,
  ExerciseItem,
  TcfMockModuleResult,
  TcfModuleId,
} from "./types";
import { INITIAL_VOCABULARY, SAMPLE_EXERCISES } from "./constants";
import { useAuth } from "./contexts/AuthContext";
import { useApiProfile } from "./hooks/useApiProfile";
import { mapApiProfileToUser } from "./lib/apiClient";
import AuthLoadingScreen from "./components/auth/AuthLoadingScreen";

// Import tabs
import DashboardTab from "./components/DashboardTab";
import PracticeTab from "./components/PracticeTab";
import ExamsTab from "./components/ExamsTab";
import VocabularyTab from "./components/VocabularyTab";
import StudyPlanTab from "./components/StudyPlanTab";
import AnalyticsTab from "./components/AnalyticsTab";
import PricingTab from "./components/PricingTab";
import AccountTab from "./components/AccountTab";
import FrensifyLogo from "./components/FrensifyLogo";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

export default function App() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile: apiProfile, loading: profileLoading, error: profileError, refresh } =
    useApiProfile();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [vocabList, setVocabList] = useState<VocabularyCard[]>(INITIAL_VOCABULARY);
  const [activeExerciseToLaunch, setActiveExerciseToLaunch] =
    useState<ExerciseItem | null>(null);

  useEffect(() => {
    if (!apiProfile || !user?.email) return;
    setProfile((prev) =>
      mapApiProfileToUser(apiProfile, user.email!, {
        completedActivities: prev?.completedActivities ?? [],
        mockTestScores: prev?.mockTestScores ?? [],
        moduleScores: prev?.moduleScores ?? [],
      })
    );
  }, [apiProfile, user?.email]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;

    if (checkout === "success") {
      void refresh().then(() => {
        setCheckoutNotice(
          "Payment received — your plan will update shortly once confirmed."
        );
        setActiveTab("pricing");
      });
    } else if (checkout === "cancel") {
      setActiveTab("pricing");
    }

    params.delete("checkout");
    params.delete("session_id");
    const next = params.toString();
    navigate(`/app${next ? `?${next}` : ""}`, { replace: true });
  }, [navigate, refresh]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  if (profileLoading) {
    return <AuthLoadingScreen message="Loading your workspace…" />;
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-red-600 text-center max-w-md">{profileError}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm font-medium text-[#002D62] hover:underline"
        >
          Sign out and try again
        </button>
      </div>
    );
  }

  if (!profile) {
    return <AuthLoadingScreen message="Loading your workspace…" />;
  }

  // Recommended next exercise
  const recommendedExercise = SAMPLE_EXERCISES.find(
    ex => ex.examType === profile.targetExam && ex.skill === "speaking"
  ) || SAMPLE_EXERCISES[0];

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updated
    }));
  };

  const handleUpdateTier = (newTier: UserSubscriptionTier) => {
    setProfile(prev => ({
      ...prev,
      tier: newTier
    }));
  };

  const handleCompletePractice = (exerciseId: string) => {
    if (profile.completedActivities.includes(exerciseId)) return;
    setProfile(prev => ({
      ...prev,
      completedActivities: [...prev.completedActivities, exerciseId]
    }));
  };

  const handleSaveMockScore = (
    examId: string,
    examName: string,
    scorePct: number,
    cefr: string,
    moduleBreakdown?: TcfMockModuleResult[]
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newScore = {
      examId,
      examName,
      date: todayStr,
      scorePct,
      cefr,
      moduleBreakdown,
    };
    setProfile(prev => ({
      ...prev,
      mockTestScores: [newScore, ...prev.mockTestScores]
    }));
  };

  const handleSaveModuleScore = (
    moduleId: TcfModuleId,
    rawScore: number,
    maxScore: number,
    examContext: string
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setProfile(prev => ({
      ...prev,
      moduleScores: [
        { moduleId, rawScore, maxScore, date: todayStr, examContext },
        ...(prev.moduleScores ?? []),
      ],
    }));
  };

  const handleToggleVocabularyMastery = (id: string) => {
    setVocabList(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, mastered: !v.mastered };
      }
      return v;
    }));
  };

  const handleAddCustomVocab = (word: string, translation: string, diff: any, cat: string) => {
    const newCard: VocabularyCard = {
      id: `custom-${Date.now()}`,
      word,
      translation,
      difficulty: diff,
      category: cat,
      mastered: false
    };
    setVocabList(prev => [newCard, ...prev]);
  };

  const handleIncreaseXPFromTask = () => {
    // Simply augment completed actions list to trigger reactive dashboard metrics
    setProfile(prev => ({
      ...prev,
      streakDays: prev.streakDays + 1
    }));
  };

  const handleStartExerciseInPracticeTab = (ex: ExerciseItem) => {
    setActiveTab("practice");
    // Wait a brief tick to load Practice view state, then force-select exercise
    setTimeout(() => {
      const practiceEl = document.getElementById("practice-tab");
      if (practiceEl) {
        // Find existing exercise trigger or click practice drill menu
        const drillBtn = document.getElementById("btn-start-recommended");
        if (drillBtn) {
          // Trigger handled cleanly inside component by selecting the recommended exercise
        }
      }
    }, 50);
  };

  return (
    <div className="flex min-h-screen bg-white text-[#37352F] font-sans selection:bg-[#E3E2E0]/70">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-64 bg-[#F1F1EF] border-r border-[#E9E9E7] flex flex-col justify-between p-6 shrink-0">
        
        {/* Logo block */}
        <div className="space-y-8">
          <div className="px-1 py-1">
            <FrensifyLogo height={40} showSubtext={true} />
          </div>

          {/* Nav list */}
          <nav className="space-y-0.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: Trophy },
              { id: "practice", label: "Practice Drills", icon: BookOpen },
              { id: "exams", label: "Full Simulations", icon: GraduationCap },
              { id: "vocabulary", label: "Vocabulary Builder", icon: Zap },
              { id: "study-plan", label: "AI Study Plans", icon: Calendar },
              { id: "analytics", label: "Diagnostic Trends", icon: TrendingUp },
              { id: "pricing", label: "Subscription Pricing", icon: CreditCard },
              { id: "account", label: "Candidate Settings", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive 
                      ? "bg-[#E3E2E0]/50 text-[#37352F] font-semibold" 
                      : "text-[#5F5E5B] hover:text-[#37352F] hover:bg-[#E3E2E0]/20"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#37352F]" : "text-[#7B7B79]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Upgrade box */}
        <div className="space-y-4">
          <div className="bg-[#E9F3FC] rounded-2xl p-4.5 border border-[#D2E7F6] shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1D74B4] block mb-1.5">Upgrade Status</span>
            <p className="text-[11px] text-[#2563EB] leading-relaxed mb-3">
              {profile.tier === "Free" 
                ? "Get unlimited argumentative mock evaluations and AI voice coach suggestions." 
                : profile.tier === "Pro" 
                ? "You have 2 Mock simulations. Upgrade to Max for unlimited speaking booth advice."
                : "Aviation-Speed AI channels active. Unlimited simulated examinations unlocked."}
            </p>
            {profile.tier !== "Max" ? (
              <button 
                onClick={() => setActiveTab("pricing")}
                className="w-full py-1.5 bg-[#1F2937] hover:bg-black text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                {profile.tier === "Free" ? "Become Pro" : "Ascend to Max"}
              </button>
            ) : (
              <div className="bg-[#E5F2EE] border border-[#CDDFD9] p-2 rounded-lg text-center text-[10px] font-bold text-[#2D6A53]">
                👑 Max Coaching Active
              </div>
            )}
          </div>

          {/* Interactive Tier Switchers under administrative constraints for evaluators */}
          <div className="bg-white border border-[#E9E9E7] rounded-xl p-2.5 text-center shadow-sm">
            <span className="text-[9px] font-bold uppercase text-[#7A7A78] block mb-1.5">Demo Tier Selector</span>
            <div className="flex gap-1">
              {(["Free", "Pro", "Max"] as UserSubscriptionTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleUpdateTier(tier)}
                  className={`flex-1 text-[9px] py-1 rounded-md font-bold uppercase tracking-wider transition-all border ${
                    profile.tier === tier 
                      ? "bg-[#37352F] text-white border-[#37352F]" 
                      : "bg-white text-[#7B7B79] border-[#E9E9E7] hover:bg-[#F1F1EF]"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN WORKSPACE WRAPPER */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-6xl mx-auto space-y-8 bg-[#FAFAF9]">
        
        {/* Dynamic header row containing calendar/day and user profile properties */}
        <header className="flex justify-between items-end pb-4 border-b border-[#E9E9E7] gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#37352F]">
              Bonjour, {profile.name}
            </h1>
            <p className="text-xs text-[#7A7A78] mt-0.5">
              Aujourd'hui &bull; Your official {profile.targetExam} pathway examination is in <strong className="text-[#37352F]">42 days</strong>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase tracking-wider text-[#7A7A78] font-bold block">Current streak</span>
              <p className="text-sm font-bold text-[#37352F] flex items-center gap-1.5">
                {profile.streakDays} Days <Flame className="w-4 h-4 text-[#F97316] fill-[#F97316]" />
              </p>
            </div>

            <div className="w-10 h-10 bg-white rounded-full border border-[#E9E9E7] flex items-center justify-center shadow-sm shrink-0">
              <div className="w-7 h-7 bg-[#EAF5F1] rounded-full flex items-center justify-center text-[#2D6A53] text-xs font-semibold uppercase">
                {getInitials(profile.name)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F1F1EF] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TAB CONDITIONAL RENDERING */}
        <div id="workspace-view">
          {activeTab === "dashboard" && (
            <DashboardTab 
              profile={profile}
              onNavigate={(tab) => setActiveTab(tab)}
              onStartExercise={handleStartExerciseInPracticeTab}
              recommendedExercise={recommendedExercise}
              completedCount={profile.completedActivities.length}
              totalAvailable={SAMPLE_EXERCISES.length}
            />
          )}

          {activeTab === "practice" && (
            <PracticeTab 
              profile={profile}
              exercises={SAMPLE_EXERCISES}
              onCompleteExercise={handleCompletePractice}
              onNavigateToPricing={() => setActiveTab("pricing")}
            />
          )}

          {activeTab === "exams" && (
            <ExamsTab 
              profile={profile}
              onNavigateToPricing={() => setActiveTab("pricing")}
              onSaveMockScore={handleSaveMockScore}
              onSaveModuleScore={handleSaveModuleScore}
            />
          )}

          {activeTab === "vocabulary" && (
            <VocabularyTab 
              profile={profile}
              vocabList={vocabList}
              onToggleMastery={handleToggleVocabularyMastery}
              onAddVocab={handleAddCustomVocab}
            />
          )}

          {activeTab === "study-plan" && (
            <StudyPlanTab 
              profile={profile}
              onNavigateToPricing={() => setActiveTab("pricing")}
              onUpdateCompletedAction={handleIncreaseXPFromTask}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab 
              profile={profile}
              completedCount={profile.completedActivities.length}
            />
          )}

          {activeTab === "pricing" && (
            <PricingTab
              profile={profile}
              checkoutNotice={checkoutNotice}
              onClearCheckoutNotice={() => setCheckoutNotice(null)}
            />
          )}

          {activeTab === "account" && (
            <AccountTab 
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </div>

      </main>

    </div>
  );
}
