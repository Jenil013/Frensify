import { supabase } from "./supabaseClient";
import type {
  AIWritingCorrection,
  AISpeakingSuggestion,
  ExamPathway,
  McqItem,
  UserProfile,
  UserSubscriptionTier,
} from "../types";
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

/** Refresh slightly before expiry so we never send an effectively-expired token. */
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

/**
 * Return a valid Supabase access token, refreshing it first if the stored
 * session is expired or about to expire. `getSession()` can hand back a stale
 * token straight after a page reload (before the client auto-refreshes), which
 * the backend rejects with 401 — guarding on `expires_at` avoids that.
 */
async function getAccessToken(forceRefresh = false): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) {
    return null;
  }

  const expiresAt = session.expires_at ?? 0;
  const expiringSoon =
    expiresAt > 0 &&
    expiresAt * 1000 <= Date.now() + TOKEN_EXPIRY_BUFFER_SECONDS * 1000;

  if (forceRefresh || expiringSoon) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    return refreshed.session?.access_token ?? session.access_token ?? null;
  }

  return session.access_token ?? null;
}

async function doFetch(
  path: string,
  options: RequestInit,
  token: string
): Promise<Response> {
  return fetch(`${FASTAPI_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  let response = await doFetch(path, options, token);

  // A 401 means the token was rejected (e.g. expired between fetch and use).
  // Force a refresh and retry once before surfacing an error.
  if (response.status === 401) {
    const refreshedToken = await getAccessToken(true);
    if (refreshedToken) {
      response = await doFetch(path, options, refreshedToken);
    }
  }

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

export async function fetchQuestions(
  examType: string,
  moduleId: string,
  limit?: number
): Promise<McqItem[]> {
  const params = new URLSearchParams({
    exam_type: examType,
    module_id: moduleId,
  });
  if (limit != null) {
    params.set("limit", String(limit));
  }
  return apiFetch<McqItem[]>(`/api/v1/questions?${params.toString()}`);
}

export interface WritingCombinationSection {
  prompt: string;
  stimulus?: string;
}

export interface WritingCombinationResponse {
  id: string;
  combinationIndex: number;
  title: string;
  sections: Record<string, WritingCombinationSection>;
}

export async function fetchWritingCombination(
  examType: string,
  moduleId: string
): Promise<WritingCombinationResponse> {
  const params = new URLSearchParams({
    exam_type: examType,
    module_id: moduleId,
  });
  return apiFetch<WritingCombinationResponse>(
    `/api/v1/writing-combination?${params.toString()}`
  );
}

export type WritingEvalContext = "practice" | "mock";

export interface WritingSectionPayload {
  section_id: string;
  prompt: string;
  essay_text: string;
  word_count: number;
  task_number?: string;
  min_words?: number;
}

export interface WritingSectionFeedbackResponse {
  section_id: string;
  feedback: AIWritingCorrection;
}

export interface WritingModuleEvalResponse {
  sections: WritingSectionFeedbackResponse[];
}

export async function submitWritingEvaluation(
  exerciseId: string,
  examType: ExamPathway,
  prompt: string,
  essayText: string,
  wordCount: number,
  taskNumber?: string,
  minWords?: number
): Promise<AIWritingCorrection> {
  return apiFetch<AIWritingCorrection>("/api/v1/ai/writing", {
    method: "POST",
    body: JSON.stringify({
      exercise_id: exerciseId,
      exam_type: examType,
      prompt,
      essay_text: essayText,
      word_count: wordCount,
      ...(taskNumber ? { task_number: taskNumber } : {}),
      ...(minWords !== undefined ? { min_words: minWords } : {}),
    }),
  });
}

export interface OralCombinationSection {
  prompt: string;
  stimulus?: string;
}

export interface OralCombinationResponse {
  id: string;
  combinationIndex: number;
  title: string;
  sections: Record<string, OralCombinationSection>;
}

export async function fetchOralCombination(
  examType: string,
  moduleId: string
): Promise<OralCombinationResponse> {
  const params = new URLSearchParams({
    exam_type: examType,
    module_id: moduleId,
  });
  return apiFetch<OralCombinationResponse>(
    `/api/v1/oral-combination?${params.toString()}`
  );
}

export interface SpeakingUploadUrlResponse {
  upload_url: string;
  storage_path: string;
}

export async function fetchSpeakingUploadUrl(): Promise<SpeakingUploadUrlResponse> {
  return apiFetch<SpeakingUploadUrlResponse>("/api/v1/ai/speaking/upload-url", {
    method: "POST",
  });
}

export async function uploadSpeakingAudio(
  uploadUrl: string,
  blob: Blob
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": "audio/webm" },
  });
  if (!response.ok) {
    throw new Error("Audio upload failed.");
  }
}

export type SpeakingEvalContext = "practice" | "mock";

export interface SpeakingSectionPayload {
  section_id: string;
  prompt: string;
  storage_path: string;
  duration_seconds: number;
}

export interface SpeakingSectionFeedbackResponse {
  section_id: string;
  feedback: AISpeakingSuggestion;
}

export interface SpeakingModuleEvalResponse {
  sections: SpeakingSectionFeedbackResponse[];
}

export async function submitSpeakingModuleEvaluation(
  moduleId: string,
  examType: ExamPathway,
  exerciseId: string,
  sections: SpeakingSectionPayload[],
  context: SpeakingEvalContext
): Promise<SpeakingModuleEvalResponse> {
  const path =
    context === "mock"
      ? "/api/v1/ai/speaking/module/mock"
      : "/api/v1/ai/speaking/module";
  return apiFetch<SpeakingModuleEvalResponse>(path, {
    method: "POST",
    body: JSON.stringify({
      module_id: moduleId,
      exam_type: examType,
      exercise_id: exerciseId,
      sections,
    }),
  });
}

export async function submitWritingModuleEvaluation(
  moduleId: string,
  examType: ExamPathway,
  sections: WritingSectionPayload[],
  context: WritingEvalContext
): Promise<WritingModuleEvalResponse> {
  const path =
    context === "mock"
      ? "/api/v1/ai/writing/module/mock"
      : "/api/v1/ai/writing/module";
  return apiFetch<WritingModuleEvalResponse>(path, {
    method: "POST",
    body: JSON.stringify({
      module_id: moduleId,
      exam_type: examType,
      sections,
    }),
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
