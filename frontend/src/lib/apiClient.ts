import { supabase } from "./supabaseClient";
import type {
  AIWritingCorrection,
  AISpeakingSuggestion,
  CefrLevel,
  ExamPathway,
  McqItem,
  UserProfile,
  UserSubscriptionTier,
  VocabExplanation,
  VocabularyCard,
  VocabularyStats,
  VocabularySuggestion,
} from "../types";

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
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> | undefined),
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${FASTAPI_BASE_URL}${path}`, {
    ...options,
    headers,
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

export interface UsageLimitsResponse {
  tier: string;
  weekStart: string;
  monthStart: string;
  weeklyUsage: {
    writingEval: number;
    speakingEval: number;
    vocabExplain: number;
  };
  weeklyCaps: {
    writingEval: number;
    speakingEval: number;
    vocabExplain: number;
  };
  monthlyMockUsage: number;
  monthlyMockCap: number;
  canStart: {
    writingPractice: boolean;
    speakingPractice: boolean;
    mockExam: boolean;
  };
}

type UsageLimitsApiResponse = {
  tier: string;
  week_start: string;
  month_start: string;
  weekly_usage: {
    writing_eval: number;
    speaking_eval: number;
    vocab_explain: number;
  };
  weekly_caps: {
    writing_eval: number;
    speaking_eval: number;
    vocab_explain: number;
  };
  monthly_mock_usage: number;
  monthly_mock_cap: number;
  can_start: {
    writing_practice: boolean;
    speaking_practice: boolean;
    mock_exam: boolean;
  };
};

function mapUsageLimits(data: UsageLimitsApiResponse): UsageLimitsResponse {
  return {
    tier: data.tier,
    weekStart: data.week_start,
    monthStart: data.month_start,
    weeklyUsage: {
      writingEval: data.weekly_usage.writing_eval,
      speakingEval: data.weekly_usage.speaking_eval,
      vocabExplain: data.weekly_usage.vocab_explain,
    },
    weeklyCaps: {
      writingEval: data.weekly_caps.writing_eval,
      speakingEval: data.weekly_caps.speaking_eval,
      vocabExplain: data.weekly_caps.vocab_explain,
    },
    monthlyMockUsage: data.monthly_mock_usage,
    monthlyMockCap: data.monthly_mock_cap,
    canStart: {
      writingPractice: data.can_start.writing_practice,
      speakingPractice: data.can_start.speaking_practice,
      mockExam: data.can_start.mock_exam,
    },
  };
}

export async function fetchUsageLimits(): Promise<UsageLimitsResponse> {
  const data = await apiFetch<UsageLimitsApiResponse>("/api/v1/usage/limits");
  return mapUsageLimits(data);
}

export interface AnalyticsSummary {
  recentMockScores: Array<{
    score_pct: number;
    cefr: string;
    taken_at: string;
    exam_name: string;
  }>;
  moduleHistory: Array<{
    module_id: string;
    raw_score: number;
    max_score: number;
    taken_at: string;
    exam_context?: string | null;
  }>;
  weeklyUsage: {
    writing_eval_count: number;
    speaking_eval_count: number;
    vocab_explain_count: number;
  };
  streakDays: number;
  tier: string;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>("/api/v1/analytics/summary");
}

export interface RecentTestItem {
  id: string;
  kind: "full_mock" | "practice" | "writing" | "speaking";
  examName: string;
  subtitle?: string | null;
  takenAt: string;
  scoreLabel: string;
  scorePct: number | null;
}

export async function fetchRecentTests(): Promise<RecentTestItem[]> {
  const data = await apiFetch<{ items: RecentTestItem[] }>(
    "/api/v1/analytics/recent-tests"
  );
  return data.items;
}

export async function postMockTestScore(payload: {
  examName: string;
  scorePct: number;
  cefr: string;
  moduleBreakdown?: unknown;
}): Promise<void> {
  await apiFetch("/api/v1/exams/scores", {
    method: "POST",
    body: JSON.stringify({
      exam_name: payload.examName,
      score_pct: payload.scorePct,
      cefr: payload.cefr,
      module_breakdown: payload.moduleBreakdown ?? null,
    }),
  });
}

export async function postModuleScore(payload: {
  examType: ExamPathway;
  moduleId: string;
  rawScore: number;
  maxScore: number;
  examContext: "practice" | "mock";
}): Promise<void> {
  await apiFetch("/api/v1/exams/module-scores", {
    method: "POST",
    body: JSON.stringify({
      exam_type: payload.examType,
      module_id: payload.moduleId,
      raw_score: payload.rawScore,
      max_score: payload.maxScore,
      exam_context: payload.examContext,
    }),
  });
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
  options?: { limit?: number }
): Promise<McqItem[]> {
  const params = new URLSearchParams({
    exam_type: examType,
    module_id: moduleId,
  });
  if (options?.limit != null) {
    params.set("limit", String(options.limit));
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

export interface ConversationTurnPayload {
  role: "examiner" | "user";
  text: string;
}

export interface SpeakingTurnMetadata {
  exam_type: string;
  section_id: string;
  prompt: string;
  stimulus?: string;
  history: ConversationTurnPayload[];
}

export interface SpeakingTurnResponse {
  user_transcript: string;
  examiner_reply: string;
}

export async function submitSpeakingTurn(
  audio: Blob,
  metadata: SpeakingTurnMetadata
): Promise<SpeakingTurnResponse> {
  const form = new FormData();
  form.append("audio", audio, "turn.webm");
  form.append("metadata", JSON.stringify(metadata));
  return apiFetch<SpeakingTurnResponse>("/api/v1/ai/speaking/turn", {
    method: "POST",
    body: form,
  });
}

export interface SpeakingUserTurnPayload {
  turn_index: number;
  storage_path: string;
  duration_seconds: number;
}

export interface SpeakingSectionPayload {
  section_id: string;
  prompt: string;
  stimulus?: string;
  conversation: ConversationTurnPayload[];
  user_turns: SpeakingUserTurnPayload[];
  duration_seconds: number;
  allocated_seconds: number;
  seconds_remaining: number;
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

type VocabularyCardApi = {
  id: string;
  word: string;
  translation: string;
  category: string;
  difficulty: string;
  mastered: boolean;
  example_sentence?: string | null;
  exam_type?: string;
  last_reviewed_at?: string | null;
  review_count?: number;
};

function mapVocabularyCard(row: VocabularyCardApi): VocabularyCard {
  return {
    id: row.id,
    word: row.word,
    translation: row.translation,
    category: row.category,
    difficulty: row.difficulty as VocabularyCard["difficulty"],
    mastered: row.mastered,
    exampleSentence: row.example_sentence ?? null,
    examType: (row.exam_type as VocabularyCard["examType"]) ?? "both",
    lastReviewedAt: row.last_reviewed_at ?? null,
    reviewCount: row.review_count ?? 0,
  };
}

export async function fetchVocabularyCards(): Promise<VocabularyCard[]> {
  const data = await apiFetch<VocabularyCardApi[]>("/api/v1/vocabulary");
  return data.map(mapVocabularyCard);
}

export async function fetchVocabularyStats(): Promise<VocabularyStats> {
  const data = await apiFetch<{
    reviewed_today: number;
    reviewed_this_week: number;
    daily_goal: number;
    daily_complete: boolean;
  }>("/api/v1/vocabulary/stats");
  return {
    reviewedToday: data.reviewed_today,
    reviewedThisWeek: data.reviewed_this_week,
    dailyGoal: data.daily_goal,
    dailyComplete: data.daily_complete,
  };
}

export async function fetchVocabularyReview(options?: {
  limit?: number;
  examType?: ExamPathway;
  categories?: string[];
}): Promise<VocabularyCard[]> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.examType) params.set("exam_type", options.examType);
  if (options?.categories?.length) {
    params.set("categories", options.categories.join(","));
  }
  const qs = params.toString();
  const data = await apiFetch<VocabularyCardApi[]>(
    `/api/v1/vocabulary/review${qs ? `?${qs}` : ""}`
  );
  return data.map(mapVocabularyCard);
}

export async function fetchVocabularySuggestions(): Promise<VocabularySuggestion> {
  const data = await apiFetch<{
    hasSuggestion: boolean;
    suggested_categories?: string[];
    reason?: string;
    source?: "writing" | "speaking" | "both";
    weakest_level?: string;
  }>("/api/v1/vocabulary/suggestions");
  return {
    hasSuggestion: data.hasSuggestion,
    suggestedCategories: data.suggested_categories,
    reason: data.reason,
    source: data.source,
    weakestLevel: data.weakest_level,
  };
}

export interface VocabularyCardInput {
  word: string;
  translation: string;
  category?: string;
  difficulty?: CefrLevel;
  exampleSentence?: string;
  examType?: ExamPathway | "both";
}

export async function addVocabularyCard(
  card: VocabularyCardInput
): Promise<VocabularyCard> {
  const data = await apiFetch<VocabularyCardApi>("/api/v1/vocabulary", {
    method: "POST",
    body: JSON.stringify({
      word: card.word,
      translation: card.translation,
      category: card.category,
      difficulty: card.difficulty,
      example_sentence: card.exampleSentence,
      exam_type: card.examType,
    }),
  });
  return mapVocabularyCard(data);
}

export async function updateVocabularyCard(
  cardId: string,
  patch: {
    mastered?: boolean;
    category?: string;
    reviewResult?: "again" | "got_it";
  }
): Promise<VocabularyCard> {
  const data = await apiFetch<VocabularyCardApi>(
    `/api/v1/vocabulary/${cardId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        mastered: patch.mastered,
        category: patch.category,
        review_result: patch.reviewResult,
      }),
    }
  );
  return mapVocabularyCard(data);
}

export async function explainVocabulary(
  word: string,
  options?: {
    translation?: string;
    category?: string;
    examType?: ExamPathway;
  }
): Promise<VocabExplanation> {
  return apiFetch<VocabExplanation>("/api/v1/ai/vocab-explain", {
    method: "POST",
    body: JSON.stringify({
      word,
      translation: options?.translation,
      category: options?.category,
      exam_type: options?.examType,
    }),
  });
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
