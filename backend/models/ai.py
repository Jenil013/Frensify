from pydantic import BaseModel, Field
from typing import Literal, Optional, List

from ai_limits import (
    MAX_CONVERSATION_TURN_TEXT,
    MAX_CONVERSATION_TURNS,
    MAX_ESSAY_TEXT_LENGTH,
    MAX_EXERCISE_ID_LENGTH,
    MAX_MIN_WORDS,
    MAX_MODULE_ID_LENGTH,
    MAX_SECTION_ID_LENGTH,
    MAX_SPEAKING_DURATION_SECONDS,
    MAX_SPEAKING_PROMPT_LENGTH,
    MAX_STIMULUS_LENGTH,
    MAX_STORAGE_PATH_LENGTH,
    MAX_VOCAB_FIELD_LENGTH,
    MAX_WORD_COUNT,
    MAX_WRITING_PROMPT_LENGTH,
)


# --- Writing ---

class WritingEvalRequest(BaseModel):
    exercise_id: str = Field(max_length=MAX_EXERCISE_ID_LENGTH)
    essay_text: str = Field(max_length=MAX_ESSAY_TEXT_LENGTH)
    word_count: int = Field(ge=0, le=MAX_WORD_COUNT)
    exam_type: str = Field(max_length=10)
    prompt: str = Field(max_length=MAX_WRITING_PROMPT_LENGTH)
    task_number: Optional[str] = Field(default=None, max_length=128)
    min_words: Optional[int] = Field(default=None, ge=0, le=MAX_MIN_WORDS)


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
    section_id: str = Field(max_length=MAX_SECTION_ID_LENGTH)
    prompt: str = Field(max_length=MAX_WRITING_PROMPT_LENGTH)
    essay_text: str = Field(max_length=MAX_ESSAY_TEXT_LENGTH)
    word_count: int = Field(ge=0, le=MAX_WORD_COUNT)
    task_number: Optional[str] = Field(default=None, max_length=128)
    min_words: Optional[int] = Field(default=None, ge=0, le=MAX_MIN_WORDS)


class WritingModuleEvalRequest(BaseModel):
    module_id: str = Field(max_length=MAX_MODULE_ID_LENGTH)
    exam_type: str = Field(max_length=10)
    sections: List[WritingSectionInput]


class WritingSectionFeedback(BaseModel):
    section_id: str
    feedback: AIWritingCorrection


class WritingModuleEvalResponse(BaseModel):
    sections: List[WritingSectionFeedback]


# --- Speaking ---

class SpeakingEvalRequest(BaseModel):
    exercise_id: str = Field(max_length=MAX_EXERCISE_ID_LENGTH)
    storage_path: str = Field(max_length=MAX_STORAGE_PATH_LENGTH)
    duration_seconds: int = Field(ge=1, le=MAX_SPEAKING_DURATION_SECONDS)
    exam_type: str = Field(max_length=10)
    prompt: str = Field(max_length=MAX_SPEAKING_PROMPT_LENGTH)


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


class ConversationTurn(BaseModel):
    role: Literal["examiner", "user"]
    text: str = Field(max_length=MAX_CONVERSATION_TURN_TEXT)


class SpeakingTurnAudio(BaseModel):
    turn_index: int = Field(ge=0)
    storage_path: str = Field(max_length=MAX_STORAGE_PATH_LENGTH)
    duration_seconds: int = Field(ge=1, le=MAX_SPEAKING_DURATION_SECONDS)


class SpeakingTurnRequest(BaseModel):
    exam_type: str = Field(max_length=10)
    section_id: str = Field(max_length=MAX_SECTION_ID_LENGTH)
    prompt: str = Field(max_length=MAX_SPEAKING_PROMPT_LENGTH)
    stimulus: Optional[str] = Field(default=None, max_length=MAX_STIMULUS_LENGTH)
    history: List[ConversationTurn] = Field(default_factory=list, max_length=MAX_CONVERSATION_TURNS)


class SpeakingTurnResponse(BaseModel):
    user_transcript: str
    examiner_reply: str


class SpeakingSectionInput(BaseModel):
    section_id: str = Field(max_length=MAX_SECTION_ID_LENGTH)
    prompt: str = Field(max_length=MAX_SPEAKING_PROMPT_LENGTH)
    stimulus: Optional[str] = Field(default=None, max_length=MAX_STIMULUS_LENGTH)
    conversation: List[ConversationTurn] = Field(max_length=MAX_CONVERSATION_TURNS)
    user_turns: List[SpeakingTurnAudio]
    duration_seconds: int = Field(ge=0, le=MAX_SPEAKING_DURATION_SECONDS)
    allocated_seconds: int = Field(ge=0, le=MAX_SPEAKING_DURATION_SECONDS)
    seconds_remaining: int = Field(default=0, ge=0, le=MAX_SPEAKING_DURATION_SECONDS)


class SpeakingModuleEvalRequest(BaseModel):
    module_id: str = Field(max_length=MAX_MODULE_ID_LENGTH)
    exam_type: str = Field(max_length=10)
    exercise_id: str = Field(max_length=MAX_EXERCISE_ID_LENGTH)
    sections: List[SpeakingSectionInput]


class SpeakingSectionFeedback(BaseModel):
    section_id: str
    feedback: AISpeakingSuggestion


class SpeakingModuleEvalResponse(BaseModel):
    sections: List[SpeakingSectionFeedback]


# --- Vocab Explain ---

class VocabExample(BaseModel):
    french: str
    english: str


class VocabExplainRequest(BaseModel):
    word: str = Field(max_length=MAX_VOCAB_FIELD_LENGTH)
    translation: Optional[str] = Field(default=None, max_length=MAX_VOCAB_FIELD_LENGTH)
    category: Optional[str] = Field(default=None, max_length=MAX_VOCAB_FIELD_LENGTH)
    exam_type: Optional[str] = Field(default=None, max_length=10)


class VocabExplainResponse(BaseModel):
    word: str
    translation: str
    difficulty: str
    explanation: str
    examSignificance: str
    examples: List[VocabExample]
    synonyms: List[str]
    exampleSentence: str
    exampleTranslation: str
    usageTip: str
    relatedWords: List[str]


# --- Speaking Upload URL ---

class SpeakingUploadUrlResponse(BaseModel):
    upload_url: str
    storage_path: str
