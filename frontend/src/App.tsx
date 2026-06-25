import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, LogOut, Menu } from "lucide-react";

import {
  UserProfile,
  FullExamReport,
  TcfMockModuleResult,
  TcfModuleId,
} from "./types";
import { useAuth } from "./contexts/AuthContext";
import { useApiProfile } from "./hooks/useApiProfile";
import {
  mapApiProfileToUser,
  postMockTestScore,
  postModuleScore,
} from "./lib/apiClient";
import { examCountdownPhrase, formatStreakLabel } from "./lib/examDate";
import AuthLoadingScreen from "./components/auth/AuthLoadingScreen";
import AppSidebar from "./components/AppSidebar";
import UserAvatar from "./components/UserAvatar";
import { useSidebarState } from "./hooks/useSidebarState";

// Import tabs
import DashboardTab from "./components/DashboardTab";
import PracticeTab from "./components/PracticeTab";
import ExamsTab from "./components/ExamsTab";
import VocabularyTab from "./components/VocabularyTab";
import PricingTab from "./components/PricingTab";
import AccountTab from "./components/AccountTab";

export default function App() {
  const navigate = useNavigate();
  const { user, session, signOut } = useAuth();
  const { profile: apiProfile, error: profileError, refresh } = useApiProfile();

  const { collapsed, isMobile, isExpanded, mobileOpen, toggleSidebar, closeMobile } =
    useSidebarState();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [profileExtras, setProfileExtras] = useState<
    Pick<UserProfile, "completedActivities" | "mockTestScores" | "moduleScores">
  >({
    completedActivities: [],
    mockTestScores: [],
    moduleScores: [],
  });
  const [profileOverrides, setProfileOverrides] = useState<Partial<UserProfile>>({});
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [vocabNav, setVocabNav] = useState<{
    mode: "review" | "browse";
    category?: string;
    categories?: string[];
  }>({ mode: "review" });
  const email = user?.email ?? session?.user?.email ?? "";
  const profile = useMemo(() => {
    if (!apiProfile || !email) return null;
    return {
      ...mapApiProfileToUser(apiProfile, email, profileExtras),
      ...profileOverrides,
    };
  }, [apiProfile, email, profileExtras, profileOverrides]);

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

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfileOverrides((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveMockScore = (
    examId: string,
    examName: string,
    scorePct: number,
    cefr: string,
    moduleBreakdown?: TcfMockModuleResult[],
    fullReport?: FullExamReport
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newScore = {
      examId,
      examName,
      date: todayStr,
      scorePct,
      cefr,
      moduleBreakdown,
      fullReport,
    };
    setProfileExtras((prev) => ({
      ...prev,
      mockTestScores: [newScore, ...prev.mockTestScores],
    }));

    void postMockTestScore({
      examName,
      scorePct,
      cefr,
      moduleBreakdown,
    })
      .then(() => refresh())
      .catch(() => {});
  };

  const handleSaveModuleScore = (
    moduleId: TcfModuleId,
    rawScore: number,
    maxScore: number,
    examContext: string
  ) => {
    if (!profile) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const context: "practice" | "mock" =
      examContext === "practice" || examContext === "Practice"
        ? "practice"
        : "mock";

    setProfileExtras((prev) => ({
      ...prev,
      moduleScores: [
        { moduleId, rawScore, maxScore, date: todayStr, examContext },
        ...prev.moduleScores,
      ],
    }));

    void postModuleScore({
      examType: profile.targetExam,
      moduleId,
      rawScore,
      maxScore,
      examContext: context,
    })
      .then(() => refresh())
      .catch(() => {});
  };

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

  const examCountdown = examCountdownPhrase(profile.targetExam, profile.examDate);

  return (
    <div className="flex min-h-screen bg-white text-[#37352F] font-sans selection:bg-[#E3E2E0]/70">
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={collapsed}
        isMobile={isMobile}
        isExpanded={isExpanded}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
        onCloseMobile={closeMobile}
      />

      {/* MAIN WORKSPACE WRAPPER */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-12 overflow-y-auto max-w-6xl mx-auto space-y-8 bg-[#FAFAF9]">
        
        {/* Dynamic header row containing calendar/day and user profile properties */}
        <header className="flex justify-between items-end pb-4 border-b border-[#E9E9E7] gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {isMobile && (
              <button
                type="button"
                onClick={toggleSidebar}
                aria-expanded={mobileOpen}
                aria-controls="app-sidebar"
                aria-label="Open navigation menu"
                className="mt-0.5 p-2 -ml-2 text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F1F1EF] rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F]/20"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#37352F] truncate">
                Bonjour, {profile.name}
              </h1>
              <p className="text-xs text-[#7A7A78] mt-0.5">
                {examCountdown.prefix}
                {examCountdown.highlight ? (
                  <>
                    {" "}
                    <strong className="text-[#37352F]">{examCountdown.highlight}</strong>
                  </>
                ) : null}
                {examCountdown.suffix ? ` ${examCountdown.suffix}` : null}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <div className="text-right shrink-0 hidden sm:block">
              <span className="text-[9px] uppercase tracking-wider text-[#7A7A78] font-bold block">Current streak</span>
              <p className="text-sm font-bold text-[#37352F] flex items-center gap-1.5">
                {formatStreakLabel(profile.streakDays)} <Flame className="w-4 h-4 text-[#F97316] fill-[#F97316]" />
              </p>
            </div>

            <UserAvatar
              name={profile.name}
              profilePictureUrl={profile.profilePictureUrl}
              size="sm"
            />

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
            />
          )}

          {activeTab === "practice" && (
            <PracticeTab
              profile={profile}
              onNavigateToPricing={() => setActiveTab("pricing")}
              onSaveModuleScore={handleSaveModuleScore}
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
              initialMode={vocabNav.mode}
              initialCategory={vocabNav.category}
              initialCategories={vocabNav.categories}
              onNavigateToPricing={() => setActiveTab("pricing")}
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
