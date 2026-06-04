// Client-side API integration for Frensify.
// Decoupled from the Node Express backend to align with your FastAPI and Supabase architecture.
// All evaluation, study planning, and vocabulary insights are driven by client-side simulations,
// allowing you to test the applet immediately in the preview.

import { AIWritingCorrection, AISpeakingSuggestion, StudyPlanResponse, WritingSectionResult } from "./types";
import {
  submitWritingEvaluation,
  submitWritingModuleEvaluation,
  type WritingEvalContext,
  type WritingSectionPayload,
} from "./lib/apiClient";

export interface VocabExplanation {
  word: string;
  translation: string;
  difficulty: string;
  explanation: string;
  examSignificance: string;
  examples: { french: string; english: string }[];
  synonyms: string[];
}

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

// 2. AI Speaking Accent & Fluency Evaluation (FastAPI-ready payload structure)
export async function evaluateSpeaking(
  prompt: string,
  transcriptText: string,
  preparationTimeSec: number,
  speakingDurationSec: number,
  examType: "TEF" | "TCF",
  sectionId?: string
): Promise<AISpeakingSuggestion> {
  console.log(
    `[FastAPI Prep] Requesting voice/transcript diagnostic for ${examType}${sectionId ? ` section ${sectionId}` : ""}...`
  );

  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    cefrLevel: "B2",
    fluencyFeedback: "Vocal flow is consistent and pacing maintains strong logical stress. Pauses are located properly before complex transition markers. Refine initial vocal attack speeds.",
    grammarAndVocab: "Demonstrates adequate structural variations. Correct gender agreements detected for primary relative clauses. Incorporate some subjonctif moods to guarantee higher scores.",
    structureAnalysis: "Introduction contains a clean thesis layout. The primary supporting argument has excellent local illustrations. Conclusion is brief but meets guidelines.",
    pronunciationTips: [
      "Keep the tongue forward and lips fully rounded when articulating the French 'u' vowel sound.",
      "Mind the phonetic liaison on plural qualifiers (e.g., 'les_atouts' should sound with a clear 'z')."
    ],
    suggestedPhrases: [
      {
        french: "Néanmoins, il convient de pondérer cette affirmation.",
        english: "Nonetheless, it is appropriate to weigh this statement.",
        context: "Excellent transition to use for the introduction of opposing arguments in Speaking Section B."
      },
      {
        french: "C'est un atout majeur pour l'administration.",
        english: "It is a major asset for the administration.",
        context: "Use to emphasize a key positive consequence of a policy change."
      }
    ],
    modelSpokenDraft: "Concernant votre question, je pense que l'initiative proposée s'avère intéressante. Néanmoins, il convient de pondérer cette affirmation. D'une part, cela représente un atout majeur; d'autre part, la logistique s'annonce ardue."
  };
}

// 3. Personalized Study Plan Generator (FastAPI-ready payload structure)
export async function generateStudyPlan(
  examType: "TEF" | "TCF",
  currentLevel: string,
  targetScore: string,
  dailyMinutes: number,
  weeksCount: number
): Promise<StudyPlanResponse> {
  console.log(`[FastAPI Prep] Compiling customized syllabus strategy over ${weeksCount} weeks...`);

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const weeklyBreakdown = Array.from({ length: weeksCount }, (_, idx) => ({
    weekNumber: idx + 1,
    theme: idx === 0 ? "Pathway Familiarity & Foundational Vocabulary" : `Exam Drills & Spoken Connectors (Week ${idx + 1})`,
    mainGoal: `Excel in Section A/B structure and integrate 25 high-level collocations into your routine.`,
    dailyTasks: {
      Monday: `Study ${examType} vocabulary catalogs for 15 minutes. Practice 5 active sentences with 'néanmoins'.`,
      Tuesday: "Perform an auditory comprehension drill. Transcribe 2 minutes of Parisian broadcast shorts.",
      Wednesday: "Write a short 150-word synthesis prompt. Highlight connectors used for argument progression.",
      Thursday: "Record yourself answering a Section A calling prompt. Practice friendly, persistent questions.",
      Friday: "Review grammar: subjonctif requirements and prepositions for country names.",
      Saturday: "Attempt a full-length sample Reading block under strict exam speed parameters.",
      Sunday: "Review error logs, flip vocabulary cards, and self-assess structural soft points."
    },
    tips: "Ensure your target practice is continuous. Spacing studies daily beats a massive block on weekends."
  }));

  return {
    weeklyBreakdown,
    expertAdvice: `Strategic Coach Advice: Focus heavily on cohesiveness indices. Evaluators for ${examType} value structural clarity, paragraph transition grammar, and self-correction capability. Make sure to integrate active connectors in every paragraph of your presentation or writing exam.`,
    prioritySkillsToBuild: [
      "Argumentative cohesion using formal connecting particles (such as: de surcroît, toutefois, de ce fait)",
      "Vocal fluency with natural pauses and rhythmic stress"
    ]
  };
}

// 4. Vocabulary Insight Explainer
export async function getVocabExplanation(word: string): Promise<VocabExplanation> {
  console.log(`[FastAPI Prep] Fetching academic profile for word: ${word}`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    word: word,
    translation: "Nevertheless / Nonetheless",
    difficulty: "B2",
    explanation: "A high-register concessive conjunction used to connect opposing ideas elegantly. It serves as a more sophisticated alternative to 'mais' or 'pourtant' in formal arguments.",
    examSignificance: `Highly favored in ${word === "Néanmoins" ? "TEF & TCF" : "Proficiency"} writing grids. Demonstrating correct usage of concessive particles elevates Cohesion parameters straight into the upper B2/C1 bands.`,
    examples: [
      {
        french: "Les arguments contre ce schéma d'organisation sont nombreux; néanmoins, nous pensons qu'il demeure viable.",
        english: "The arguments against this organizational scheme are numerous; nevertheless, we believe that it remains viable."
      }
    ],
    synonyms: ["toutefois", "cependant", "néanmoins", "pourtant"]
  };
}

// 5. Applet Metadata Configuration
export async function getAPIConfig(): Promise<{ hasGeminiKey: boolean; appName: string }> {
  // Simulating config check local
  return {
    hasGeminiKey: true,
    appName: "Frensify"
  };
}
