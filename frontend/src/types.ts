// Frensify Types & Interfaces

import type { CefrLevel } from "./tefConstants";

export type ExamPathway = "TEF" | "TCF";

export type { CefrLevel };

export type SkillType = "listening" | "reading" | "speaking" | "writing";

export type UserSubscriptionTier = "Free" | "Pro" | "Max";

export interface MockTestScore {
  examId: string;
  examName: string;
  date: string;
  scorePct: number;
  cefr: string;
  moduleBreakdown?: TcfMockModuleResult[];
}

export interface TcfMockModuleResult {
  moduleId: TcfModuleId;
  moduleLabel: string;
  rawScore?: number;
  maxScore?: number;
  scorePct?: number;
  sectionCefr?: { A?: string; B?: string };
}

export interface ModuleScoreRecord {
  moduleId: TcfModuleId;
  rawScore: number;
  maxScore: number;
  date: string;
  examContext?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  targetExam: ExamPathway;
  targetScore: CefrLevel; // CEFR target (A1–C2) for TEF/TCF analytics
  currentLevel: CefrLevel;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  tier: UserSubscriptionTier;
  completedActivities: string[]; // ids of exercises completed
  mockTestScores: MockTestScore[];
  moduleScores?: ModuleScoreRecord[];
}

// --- TCF official module structure (Supabase-ready) ---

export type TcfModuleId =
  | "comprehension-ecrite"
  | "comprehension-orale"
  | "expression-ecrite"
  | "expression-orale";

export interface TcfSectionMeta {
  id: "A" | "B";
  label: string;
  durationMinutes: number;
  minWords?: number;
  taskType: "mcq" | "essay" | "oral-response";
}

export interface TcfModuleMeta {
  id: TcfModuleId;
  labelFr: string;
  labelEn: string;
  objective: string;
  durationMinutes: number;
  questionCount?: number;
  format: "mcq" | "sections";
  scoring: "+1/0" | "ai-rubric";
  sections?: TcfSectionMeta[];
}

export interface McqItem {
  id: string;
  prompt: string;
  passage?: string;
  audioUrl?: string;
  transcript?: string;
  choices: string[];
  correctChoiceIndex: number;
  explanation?: string;
}

export interface TcfExpressionSection {
  prompt: string;
  stimulus?: string;
}

export interface TcfModuleDefinition {
  meta: TcfModuleMeta;
  questions?: McqItem[];
  sections?: {
    A: TcfExpressionSection;
    B: TcfExpressionSection;
  };
}

export interface McqModuleResult {
  rawScore: number;
  maxScore: number;
  answers: (number | null)[];
}

export interface WritingSectionResult {
  sectionId: "A" | "B";
  text: string;
  wordCount: number;
  feedback?: AIWritingCorrection;
}

export interface WritingModuleResult {
  sections: WritingSectionResult[];
}

export interface OralSectionResult {
  sectionId: "A" | "B";
  transcript: string;
  durationSeconds: number;
  feedback?: AISpeakingSuggestion;
}

export interface OralModuleResult {
  sections: OralSectionResult[];
}

export type TcfModuleCompletionResult =
  | { type: "mcq"; result: McqModuleResult }
  | { type: "writing"; result: WritingModuleResult }
  | { type: "oral"; result: OralModuleResult };

export interface VocabularyCard {
  id: string;
  word: string;
  translation: string;
  category: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  mastered: boolean;
}

export interface ExerciseItem {
  id: string;
  examType: ExamPathway;
  skill: SkillType;
  title: string;
  difficulty: string;
  durationMinutes: number;
  prompt: string;
  passage?: string; // For reading
  audioUrl?: string; // For listening (we can simulate beautiful audio feedback & audio controls)
  transcript?: string; // For listening review
  questionType: "multiple-choice" | "essay" | "oral-response";
  choices?: string[];
  correctChoiceIndex?: number;
  explanation?: string;
  isPremium?: boolean; // True for Premium and Max
  isMax?: boolean; // True for Max only
}

export interface AIWritingCorrection {
  cefrScore: string;
  scoreRange: string;
  overallFeedback: string;
  dimensionScores: {
    vocabulary: string;
    grammar: string;
    coherence: string;
    taskCompleteness: string;
  };
  detailedCorrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  improvedVersion: string;
}

export interface AISpeakingSuggestion {
  cefrLevel: string;
  fluencyFeedback: string;
  grammarAndVocab: string;
  structureAnalysis: string;
  pronunciationTips: string[];
  suggestedPhrases: {
    french: string;
    english: string;
    context: string;
  }[];
  modelSpokenDraft: string;
}

export interface StudyPlanDay {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

export interface StudyPlanWeek {
  weekNumber: number;
  theme: string;
  mainGoal: string;
  dailyTasks: StudyPlanDay;
  tips: string;
}

export interface StudyPlanResponse {
  weeklyBreakdown: StudyPlanWeek[];
  expertAdvice: string;
  prioritySkillsToBuild: string[];
}
