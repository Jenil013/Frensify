// Client-side API integration for Frensify.
// Decoupled from the Node Express backend to align with your FastAPI and Supabase architecture.
// All evaluation and vocabulary insights are driven by client-side simulations,
// allowing you to test the applet immediately in the preview.

import {
  AIWritingCorrection,
  OralSectionResult,
  WritingSectionResult,
} from "./types";
import {
  explainVocabulary,
  fetchSpeakingUploadUrl,
  submitSpeakingModuleEvaluation,
  submitWritingEvaluation,
  submitWritingModuleEvaluation,
  uploadSpeakingAudio,
  type SpeakingEvalContext,
  type WritingEvalContext,
  type WritingSectionPayload,
} from "./lib/apiClient";

export type { VocabExplanation } from "./types";

/**
 * ============================================================================
 * ARCHITECTURE ROADMAP: FASTAPI & SUPABASE INTEGRATION
 * ============================================================================
 * 
 * 1. SUPABASE CLIENT SET UP:
 *    Install: npm install @supabase/supabase-js
 *    Initialize (e.g., in /src/supabaseClient.ts):
 *    ---------------------------------------------------------
 *    import { createClient } from "@supabase/supabase-js";
 *    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
 *    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
 *    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 *    ---------------------------------------------------------
 * 
 * 2. SUPABASE TABLE SCHEMAS (Suggested):
 *    - profiles: { id_user (uuid, fk auth), name (text), target_exam (text), target_score (text), streak_days (int) }
 *    - completed_exercises: { id (uuid), user_id (uuid), exercise_id (text), completed_at (timestamptz) }
 *    - scores: { id (uuid), user_id (uuid), exam_id (text), score_pct (int), cefr_level (text) }
 * 
 * 3. FASTAPI ENDPOINT PROXIES:
 *    To route requests securely to your FastAPI backend (running e.g. at http://localhost:8000),
 *    replace the simulation return blocks with a simple fetch configuration:
 *    ---------------------------------------------------------
 *    const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || "http://localhost:8000";
 *    const response = await fetch(`${FASTAPI_BASE_URL}/api/v1/feedback/writing`, {
 *      method: "POST",
 *      headers: { "Content-Type": "application/json" },
 *      body: JSON.stringify({ prompt, essay, task_type: taskType, exam_type: examType }),
 *    });
 *    return response.json();
 *    ---------------------------------------------------------
 */

// 1. AI Writing Evaluation — standalone practice essays via FastAPI + Gemini
export async function evaluateWriting(
  prompt: string,
  essay: string,
  taskType: string,
  examType: "TEF" | "TCF",
  options?: { taskNumber?: string; minWords?: number }
): Promise<AIWritingCorrection> {
  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  return submitWritingEvaluation(
    taskType,
    examType,
    prompt,
    essay,
    wordCount,
    options?.taskNumber,
    options?.minWords
  );
}

export async function evaluateWritingModule(
  moduleId: string,
  examType: "TEF" | "TCF",
  sections: WritingSectionPayload[],
  context: WritingEvalContext
): Promise<WritingSectionResult[]> {
  const response = await submitWritingModuleEvaluation(
    moduleId,
    examType,
    sections,
    context
  );
  return response.sections.map((section) => {
    const input = sections.find((s) => s.section_id === section.section_id)!;
    return {
      sectionId: section.section_id,
      text: input.essay_text,
      wordCount: input.word_count,
      feedback: section.feedback,
    };
  });
}

export interface SpeakingSectionUpload {
  section_id: string;
  prompt: string;
  blob: Blob;
  duration_seconds: number;
}

export async function evaluateSpeakingModule(
  moduleId: string,
  examType: "TEF" | "TCF",
  exerciseId: string,
  sections: SpeakingSectionUpload[],
  context: SpeakingEvalContext
): Promise<OralSectionResult[]> {
  const uploaded = await Promise.all(
    sections.map(async (section) => {
      const { upload_url, storage_path } = await fetchSpeakingUploadUrl();
      await uploadSpeakingAudio(upload_url, section.blob);
      return {
        section_id: section.section_id,
        prompt: section.prompt,
        storage_path,
        duration_seconds: section.duration_seconds,
      };
    })
  );

  const response = await submitSpeakingModuleEvaluation(
    moduleId,
    examType,
    exerciseId,
    uploaded,
    context
  );

  return response.sections.map((section) => {
    const input = sections.find((s) => s.section_id === section.section_id)!;
    return {
      sectionId: section.section_id,
      transcript: "",
      durationSeconds: input.duration_seconds,
      feedback: section.feedback,
      examinerCue: input.prompt,
    };
  });
}

// 3. Vocabulary Insight Explainer — FastAPI + Gemini
export async function getVocabExplanation(
  word: string,
  options?: { translation?: string; examType?: "TEF" | "TCF" }
) {
  return explainVocabulary(word, options);
}

// 5. Applet Metadata Configuration
export async function getAPIConfig(): Promise<{ hasGeminiKey: boolean; appName: string }> {
  // Simulating config check local
  return {
    hasGeminiKey: true,
    appName: "Frensify"
  };
}
