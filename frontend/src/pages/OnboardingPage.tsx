import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FrensifyLogo from "../components/FrensifyLogo";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../lib/apiClient";
import { useApiProfile } from "../hooks/useApiProfile";
import type { ExamPathway } from "../types";
import type { CefrLevel } from "../tefConstants";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { setProfile: setCachedProfile } = useApiProfile();

  const [name, setName] = useState(
    user?.user_metadata?.full_name?.split(" ")[0] ??
      user?.email?.split("@")[0] ??
      ""
  );
  const [targetExam, setTargetExam] = useState<ExamPathway>("TEF");
  const [currentLevel, setCurrentLevel] = useState<CefrLevel>("B1");
  const [targetScore, setTargetScore] = useState<CefrLevel>("B2");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const updated = await updateProfile({
        name: name.trim() || undefined,
        target_exam: targetExam,
        current_level: currentLevel,
        target_score: targetScore,
      });
      setCachedProfile(updated);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg mb-4 flex justify-start">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-sm text-[#5F5E5B] hover:text-[#37352F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Sign out and use a different account
        </button>
      </div>

      <div className="mb-8">
        <FrensifyLogo height={40} showSubtext={true} />
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E9E9E7] p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#37352F] tracking-tight">
            Set up your exam path
          </h1>
          <p className="text-sm text-[#7A7A78] mt-1">
            We will tailor practice and analytics to your goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
              Your name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[#E9E9E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#002D62]/20 focus:border-[#002D62]"
              placeholder="How should we greet you?"
            />
          </label>

          <fieldset>
            <legend className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
              Target exam
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["TEF", "TCF"] as ExamPathway[]).map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => setTargetExam(exam)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    targetExam === exam
                      ? "bg-[#002D62] text-white border-[#002D62]"
                      : "bg-white text-[#37352F] border-[#E9E9E7] hover:border-[#002D62]/30"
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
                Current level
              </span>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as CefrLevel)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[#E9E9E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#002D62]/20"
              >
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
                Target score
              </span>
              <select
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value as CefrLevel)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[#E9E9E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#002D62]/20"
              >
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 space-y-1">
              <p>{error}</p>
              {error.toLowerCase().includes("token") && (
                <p className="text-xs text-red-500/90">
                  Try signing out below, then sign in again. If it persists, restart
                  the API server after updating backend dependencies.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#002D62] hover:bg-[#001D42] text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Continue to dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#7A7A78]">
          Signed in as{" "}
          <span className="text-[#37352F]">{user?.email}</span>
          {" · "}
          <button
            type="button"
            onClick={handleSignOut}
            className="font-medium text-[#002D62] hover:underline"
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
