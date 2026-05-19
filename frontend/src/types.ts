// Frensify Types & Interfaces

export type ExamPathway = "TEF" | "TCF";

export type SkillType = "listening" | "reading" | "speaking" | "writing";

export type UserSubscriptionTier = "Free" | "Pro" | "Max";

export interface UserProfile {
  name: string;
  email: string;
  targetExam: ExamPathway;
  targetScore: string; // e.g. "CLB 7 (B2)", "CLB 9 (C1)"
  currentLevel: string; // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  tier: UserSubscriptionTier;
  completedActivities: string[]; // ids of exercises completed
  mockTestScores: { examId: string; examName: string; date: string; scorePct: number; cefr: string }[];
}

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
