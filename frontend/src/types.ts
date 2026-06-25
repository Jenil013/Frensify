// Frensify Types & Interfaces

import type { CefrLevel } from "./tefConstants";

export type ExamPathway = "TEF" | "TCF";

export type { CefrLevel };

export type SkillType = "listening" | "reading" | "speaking" | "writing";

export type UserSubscriptionTier = "Free" | "Pro" | "Max";

export interface FullExamReportModule {
  moduleId: string;
  moduleLabel: string;
  skill: SkillType;
  type: "mcq" | "writing" | "oral";
  rawScore?: number;
  maxScore?: number;
  scorePct?: number;
  cefrEstimate?: string;
  sectionLabels?: string[];
  writingSections?: WritingSectionResult[];
  oralSections?: OralSectionResult[];
}

export interface FullExamReport {
  examType: ExamPathway;
  examId: string;
  examName: string;
  date: string;
  comprehensionAggregatePct: number;
  estimatedCefr: string;
  modules: FullExamReportModule[];
}

export interface MockTestScore {
  examId: string;
  examName: string;
  date: string;
  scorePct: number;
  cefr: string;
  moduleBreakdown?: TcfMockModuleResult[];
  fullReport?: FullExamReport;
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
  examDate: string | null; // YYYY-MM-DD official exam date
  profilePictureUrl?: string | null;
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
  id: string;
  label: string;
  durationMinutes: number;
  minWords?: number;
  maxWords?: number;
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
  imageUrl?: string;
  transcript?: string;
  choices: string[];
  correctChoiceIndex: number;
  explanation?: string;
  difficulty?: string;
}

export interface TcfExpressionSection {
  prompt: string;
  stimulus?: string;
}

export interface TcfModuleDefinition {
  meta: TcfModuleMeta;
  questions?: McqItem[];
  sections?: Record<string, TcfExpressionSection>;
  combinationId?: string;
  combinationTitle?: string;
}

export interface McqModuleResult {
  rawScore: number;
  maxScore: number;
  answers: (number | null)[];
  questions: McqItem[];
}

export interface WritingSectionResult {
  sectionId: string;
  text: string;
  wordCount: number;
  feedback?: AIWritingCorrection;
}

export interface WritingModuleResult {
  sections: WritingSectionResult[];
}

export interface OralSectionResult {
  sectionId: string;
  transcript: string;
  durationSeconds: number;
  feedback?: AISpeakingSuggestion;
  examinerCue?: string;
  conversation?: ConversationTurn[];
}

export interface ConversationTurn {
  role: "examiner" | "user";
  text: string;
}

export interface OralModuleResult {
  sections: OralSectionResult[];
}

export type TcfModuleCompletionResult =
  | { type: "mcq"; result: McqModuleResult }
  | {
      type: "writing";
      result: WritingModuleResult;
      pendingEval?: Promise<WritingModuleResult>;
    }
  | {
      type: "oral";
      result: OralModuleResult;
      pendingEval?: Promise<OralModuleResult>;
    };

export interface VocabularyCard {
  id: string;
  word: string;
  translation: string;
  category: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  mastered: boolean;
  exampleSentence?: string | null;
  examType?: ExamPathway | "both";
  lastReviewedAt?: string | null;
  reviewCount?: number;
}

export interface VocabularyStats {
  reviewedToday: number;
  reviewedThisWeek: number;
  dailyGoal: number;
  dailyComplete: boolean;
}

export interface VocabularySuggestion {
  hasSuggestion: boolean;
  suggestedCategories?: string[];
  reason?: string;
  source?: "writing" | "speaking" | "both";
  weakestLevel?: string;
}

export interface VocabExplanation {
  word: string;
  translation: string;
  difficulty: string;
  explanation: string;
  examSignificance: string;
  examples: { french: string; english: string }[];
  synonyms: string[];
  exampleSentence: string;
  exampleTranslation: string;
  usageTip: string;
  relatedWords: string[];
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
  analysis: string;
  overallFeedback: string;
  cefrScore: string;
  scoreRange: string;
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

// --- TEF official module structure ---

export type TefModuleId =
  | "comprehension-orale"
  | "comprehension-ecrite"
  | "expression-ecrite"
  | "expression-orale";

export interface TefSectionMeta {
  id: string;
  label: string;
  durationMinutes: number;
  minWords?: number;
  maxWords?: number;
  taskType: "mcq" | "essay" | "oral-response";
}

export interface TefModuleMeta {
  id: TefModuleId;
  labelFr: string;
  labelEn: string;
  objective: string;
  durationMinutes: number;
  questionCount?: number;
  format: "mcq" | "sections";
  scoring: "+1/0" | "ai-rubric";
  sections?: TefSectionMeta[];
}

export interface TefExpressionSection {
  prompt: string;
  stimulus?: string;
}

export interface TefModuleDefinition {
  meta: TefModuleMeta;
  questions?: McqItem[];
  sections?: Record<string, TefExpressionSection>;
  combinationId?: string;
  combinationTitle?: string;
}

export interface TefModuleCompletionResult {
  type: "mcq" | "writing" | "oral";
  moduleId: TefModuleId;
  result: McqModuleResult | WritingModuleResult | OralModuleResult;
  pendingEval?: Promise<WritingModuleResult> | Promise<OralModuleResult>;
}

export interface TefMockModuleResult {
  moduleId: TefModuleId;
  moduleLabel: string;
  rawScore?: number;
  maxScore?: number;
  scorePct?: number;
  sectionCefr?: Record<string, string | undefined>;
}
