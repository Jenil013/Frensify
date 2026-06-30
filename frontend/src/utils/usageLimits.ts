import type { SkillType } from "../types";
import type { UsageLimitsResponse } from "../lib/apiClient";

export type UsageLimitReason =
  | "tier_locked"
  | "weekly_exhausted"
  | "weekly_mock_exhausted";

export interface UsageLimitBlock {
  reason: UsageLimitReason;
  title: string;
  message: string;
  showUpgrade: boolean;
}

export function practiceLimitBlock(
  limits: UsageLimitsResponse,
  skill: "writing" | "speaking"
): UsageLimitBlock | null {
  const cap =
    skill === "writing"
      ? limits.weeklyCaps.writingEval
      : limits.weeklyCaps.speakingEval;
  const used =
    skill === "writing"
      ? limits.weeklyUsage.writingEval
      : limits.weeklyUsage.speakingEval;
  const allowed =
    skill === "writing"
      ? limits.canStart.writingPractice
      : limits.canStart.speakingPractice;

  if (allowed) return null;

  const skillLabel = skill === "writing" ? "writing" : "speaking";

  if (cap === 0) {
    return {
      reason: "tier_locked",
      title: `${skillLabel === "writing" ? "Writing" : "Speaking"} feedback requires a plan`,
      message: `AI ${skillLabel} evaluation is included with Pro and Max. Upgrade to run full ${skillLabel} modules with examiner-style feedback.`,
      showUpgrade: true,
    };
  }

  return {
    reason: "weekly_exhausted",
    title: "Weekly limit reached",
    message: `You've used all ${cap} AI ${skillLabel} evaluation${cap === 1 ? "" : "s"} for this week (${used}/${cap}). Your limit resets Monday.`,
    showUpgrade: limits.tier === "Pro",
  };
}

export function mockExamLimitBlock(
  limits: UsageLimitsResponse
): UsageLimitBlock | null {
  if (limits.canStart.mockExam) return null;

  if (limits.weeklyMockCap === 0) {
    return {
      reason: "tier_locked",
      title: "Full simulations require Pro or Max",
      message:
        "Timed full-exam simulations with AI writing and speaking feedback are included with Pro and Max.",
      showUpgrade: true,
    };
  }

  return {
    reason: "weekly_mock_exhausted",
    title: "Weekly simulation limit reached",
    message: `You've completed all ${limits.weeklyMockCap} full exam simulation${limits.weeklyMockCap === 1 ? "" : "s"} this week (${limits.weeklyMockUsage}/${limits.weeklyMockCap}). Your limit resets Monday.`,
    showUpgrade: limits.tier === "Pro",
  };
}

export function skillNeedsAiEval(skill: SkillType): skill is "writing" | "speaking" {
  return skill === "writing" || skill === "speaking";
}
