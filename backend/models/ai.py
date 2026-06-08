from pydantic import BaseModel
from typing import Optional, List


# --- Writing ---

class WritingEvalRequest(BaseModel):
    exercise_id: str
    essay_text: str
    word_count: int
    exam_type: str
    prompt: str
    task_number: Optional[str] = None
    min_words: Optional[int] = None


class DimensionScores(BaseModel):
    vocabulary: str
    grammar: str
    coherence: str
    taskCompleteness: str


class DetailedCorrection(BaseModel):
    original: str
    corrected: str
    explanation: str


class AIWritingCorrection(BaseModel):
    analysis: str
    overallFeedback: str
    cefrScore: str
    scoreRange: str
    dimensionScores: DimensionScores
    detailedCorrections: List[DetailedCorrection]
    improvedVersion: str


class WritingSectionInput(BaseModel):
    section_id: str
    prompt: str
    essay_text: str
    word_count: int
    task_number: Optional[str] = None
    min_words: Optional[int] = None


class WritingModuleEvalRequest(BaseModel):
    module_id: str
    exam_type: str
    sections: List[WritingSectionInput]


class WritingSectionFeedback(BaseModel):
    section_id: str
    feedback: AIWritingCorrection


class WritingModuleEvalResponse(BaseModel):
    sections: List[WritingSectionFeedback]


# --- Speaking ---

class SpeakingEvalRequest(BaseModel):
    exercise_id: str
    storage_path: str
    duration_seconds: int
    exam_type: str
    prompt: str


class SuggestedPhrase(BaseModel):
    french: str
    english: str
    context: str


class AISpeakingSuggestion(BaseModel):
    cefrLevel: str
    fluencyFeedback: str
    grammarAndVocab: str
    structureAnalysis: str
    pronunciationTips: List[str]
    suggestedPhrases: List[SuggestedPhrase]
    modelSpokenDraft: str


class SpeakingSectionInput(BaseModel):
    section_id: str
    prompt: str
    storage_path: str
    duration_seconds: int


class SpeakingModuleEvalRequest(BaseModel):
    module_id: str
    exam_type: str
    exercise_id: str
    sections: List[SpeakingSectionInput]


class SpeakingSectionFeedback(BaseModel):
    section_id: str
    feedback: AISpeakingSuggestion


class SpeakingModuleEvalResponse(BaseModel):
    sections: List[SpeakingSectionFeedback]


# --- Study Plan ---

class StudyPlanRequest(BaseModel):
    exam_type: str
    current_level: str
    target_score: str
    weeks_count: int
    daily_minutes: int


class StudyPlanDay(BaseModel):
    Monday: str
    Tuesday: str
    Wednesday: str
    Thursday: str
    Friday: str
    Saturday: str
    Sunday: str


class StudyPlanWeek(BaseModel):
    weekNumber: int
    theme: str
    mainGoal: str
    dailyTasks: StudyPlanDay
    tips: str


class StudyPlanResponse(BaseModel):
    weeklyBreakdown: List[StudyPlanWeek]
    expertAdvice: str
    prioritySkillsToBuild: List[str]


# --- Vocab Explain ---

class VocabExplainRequest(BaseModel):
    word: str
    translation: str
    category: Optional[str] = None


class VocabExplainResponse(BaseModel):
    word: str
    exampleSentence: str
    exampleTranslation: str
    usageTip: str
    relatedWords: List[str]


# --- Speaking Upload URL ---

class SpeakingUploadUrlResponse(BaseModel):
    upload_url: str
    storage_path: str
