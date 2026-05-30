import { supabase } from "./supabaseClient";
import type { ExamPathway, UserProfile, UserSubscriptionTier } from "../types";
import type { CefrLevel } from "../tefConstants";

const FASTAPI_BASE_URL =
  import.meta.env.VITE_FASTAPI_BASE_URL ?? "http://localhost:8000";

export interface ApiProfile {
  id: string;
  name: string | null;
  target_exam: string | null;
  target_score: string | null;
  current_level: string | null;
  streak_days: number;
  last_active_date: string | null;
  tier: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  created_at: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  target_exam?: ExamPathway;
  target_score?: CefrLevel;
  current_level?: CefrLevel;
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(`${FASTAPI_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail =
      typeof body.detail === "string"
        ? body.detail
        : `Request failed (${response.status})`;
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchProfile(): Promise<ApiProfile> {
  return apiFetch<ApiProfile>("/api/v1/profile");
}

export async function updateProfile(
  patch: ProfileUpdatePayload
): Promise<ApiProfile> {
  return apiFetch<ApiProfile>("/api/v1/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function createCheckoutSession(
  tier: Extract<UserSubscriptionTier, "Pro" | "Max">
): Promise<{ url: string }> {
  return apiFetch<{ url: string }>("/api/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
}

export async function openBillingPortal(): Promise<{ url: string }> {
  return apiFetch<{ url: string }>("/api/v1/billing/portal", {
    method: "POST",
  });
}

export function isOnboardingComplete(profile: ApiProfile | null): boolean {
  return Boolean(profile?.target_exam);
}

export function mapApiProfileToUser(
  api: ApiProfile,
  email: string,
  extras?: Pick<
    UserProfile,
    "completedActivities" | "mockTestScores" | "moduleScores"
  >
): UserProfile {
  const today = new Date().toISOString().split("T")[0];
  return {
    name: api.name ?? email.split("@")[0] ?? "Student",
    email,
    targetExam: (api.target_exam as ExamPathway) ?? "TEF",
    targetScore: (api.target_score as CefrLevel) ?? "B2",
    currentLevel: (api.current_level as CefrLevel) ?? "B1",
    streakDays: api.streak_days,
    lastActiveDate: api.last_active_date ?? today,
    tier: api.tier as UserSubscriptionTier,
    completedActivities: extras?.completedActivities ?? [],
    mockTestScores: extras?.mockTestScores ?? [],
    moduleScores: extras?.moduleScores ?? [],
  };
}
