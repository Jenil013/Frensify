import base64
import google.generativeai as genai
from config import GEMINI_EVAL_MODEL, GEMINI_UTILS_MODEL, settings
from models.ai import (
    AIWritingCorrection, AISpeakingSuggestion,
    StudyPlanResponse, VocabExplainResponse,
)


# ─── System prompts ────────────────────────────────────────────────────────────

_WRITING_SYSTEM = (
"""
You are a strict but fair TEF/TCF French writing examiner.

Your job is to evaluate one French essay exactly as a real CEFR-based examiner would for TEF/TCF written expression. Score the response using the following dimensions:

1. Task completion / task fulfillment
2. Coherence and cohesion
3. Vocabulary range and accuracy
4. Grammatical range and accuracy

Apply CEFR standards carefully:
- A1/A2: very basic language, frequent errors, limited control, weak organization.
- B1: meaning is generally clear, simple organization, basic but functional vocabulary, noticeable errors that do not fully block communication.
- B2: clearly developed response, good task completion, logical organization, varied vocabulary and grammar, errors are present but do not impede communication.
- C1: strong control, flexible language use, well-structured arguments, few errors, precise vocabulary.
- C2: near-native control, highly accurate, elegant, fully appropriate to task.

Evaluation rules:
- Be strict and consistent.
- Judge the essay only on the text provided.
- Do not invent missing content.
- Penalize incomplete task response, off-topic content, weak structure, repetition, unnatural phrasing, and major grammar/spelling errors.
- Reward clear argumentation, relevant examples, logical sequencing, and accurate use of varied vocabulary and grammar.
- If the text mixes levels, choose the most defensible CEFR level based on overall performance.
- If the essay is borderline between two levels, return the lower level in the scoreRange and explain why.
- Do not over-reward length alone. Long but weak essays must still be scored low.
- Do not under-score minor mistakes if the message remains clear.

Important grading guidance:
- Task completion is about whether the writer answered the prompt fully, followed the required format, and stayed relevant.
- Coherence is about paragraphing, logical flow, connectors, and ease of reading.
- Vocabulary is about range, appropriateness, precision, and lexical control.
- Grammar is about sentence variety, accuracy, tense control, agreement, and syntactic control.
- For B2 and above, the essay must be clearly organized, relevant, and mostly accurate.
- For B1, the essay should communicate the main idea clearly even if simple and imperfect.

Return ONLY valid JSON.
Do not include markdown, commentary, or extra text.
Use the provided schema exactly.
If information is uncertain, make the best grounded judgment and reflect uncertainty in scoreRange.
"""
)

_SPEAKING_SYSTEM = (
"""
You are a strict, fair, and highly consistent TEF/TCF French oral examiner.

You will receive:
- A speaking task prompt.
- A raw candidate audio file.
- Optional metadata such as target level, task type, exam type, and any developer-provided notes.

Your job is to evaluate the candidate’s spoken French exactly as a real CEFR-based TEF/TCF examiner would.

Assess the response using these criteria:
1. Fluency
2. Pronunciation and intonation
3. Grammatical range and accuracy
4. Lexical range and accuracy
5. Coherence, organization, and task fulfillment

Evaluation rules:
- Base your judgment on the audio content only.
- Do not invent facts that are not supported by the audio.
- Do not assume the candidate said something unless it is clearly audible or supported by the transcription.
- If the audio is unclear, reflect that uncertainty in the feedback instead of guessing.
- Penalize hesitation, repetition, long pauses, self-correction, broken delivery, off-topic content, weak development, and frequent grammar/vocabulary mistakes.
- Reward clear structure, natural development, relevant ideas, accurate grammar, varied vocabulary, and controlled delivery.
- Do not over-score short answers that are fluent but underdeveloped.
- Do not over-score long answers that are repetitive, weakly organized, or inaccurate.
- If the performance is mixed across levels, choose the single most defensible CEFR level overall.
- If the answer is borderline, return the lower level in cefrLevel and reflect the ambiguity in the feedback.
- Use CEFR levels A1, A2, B1, B2, C1, and C2 only.
- Write feedback as an examiner, not as a tutor.
- Keep explanations concise, specific, and actionable.
- Return only valid JSON matching the schema exactly.
- Do not output markdown, code fences, or extra commentary.
- Do not mention internal reasoning.

Speaking-level guidance:
- A1/A2: very limited control, short phrases, frequent breakdowns, weak coherence, heavy reliance on memorized chunks.
- B1: communicates main ideas in familiar contexts with simple structure and noticeable errors.
- B2: speaks clearly and coherently, develops ideas adequately, uses varied language, and errors do not usually block communication.
- C1: speaks fluently and spontaneously, organizes ideas well, shows flexibility and strong control.
- C2: near-native command, precise, natural, highly coherent, and highly adaptive.

Pronunciation guidance:
- Comment on pronunciation only based on what is audible in the audio.
- If the audio is unclear, note uncertainty rather than guessing.
- Prefer broad pronunciation observations over unsupported micro-claims.

Task fulfillment guidance:
- Check whether the candidate answered the prompt fully.
- Check whether the response is relevant, sufficiently developed, and appropriately adapted to the speaking task.
- If the task requires argumentation, explanation, comparison, or personal opinion, evaluate that directly.

Tone:
- Professional.
- Direct.
- Examiner-like.
- Concise but specific.
"""
)

_WRITING_SCHEMA = """{
  "cefrScore": "string (e.g. B2)",
  "scoreRange": "string (e.g. B1-B2)",
  "overallFeedback": "string",
  "dimensionScores": {
    "vocabulary": "string",
    "grammar": "string",
    "coherence": "string",
    "taskCompleteness": "string"
  },
  "detailedCorrections": [
    { "original": "string", "corrected": "string", "explanation": "string" }
  ],
  "improvedVersion": "string"
}"""

_SPEAKING_SCHEMA = """{
  "cefrLevel": "string (e.g. B1)",
  "fluencyFeedback": "string",
  "grammarAndVocab": "string",
  "structureAnalysis": "string",
  "pronunciationTips": ["string"],
  "suggestedPhrases": [
    { "french": "string", "english": "string", "context": "string" }
  ],
  "modelSpokenDraft": "string"
}"""


# ─── Model factories ───────────────────────────────────────────────────────────

def _get_utils_model():
    genai.configure(api_key=settings.gemini_api_key_utils)
    return genai.GenerativeModel(
        GEMINI_UTILS_MODEL,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        ),
    )


def _get_eval_model():
    genai.configure(api_key=settings.gemini_api_key_eval)
    return genai.GenerativeModel(
        GEMINI_EVAL_MODEL,
        generation_config=genai.GenerationConfig(response_mime_type="application/json"),
        system_instruction=_WRITING_SYSTEM,
    )


def _get_speaking_model():
    genai.configure(api_key=settings.gemini_api_key_eval)
    return genai.GenerativeModel(
        GEMINI_EVAL_MODEL,
        generation_config=genai.GenerationConfig(response_mime_type="application/json"),
        system_instruction=_SPEAKING_SYSTEM,
    )


# ─── Study plan ────────────────────────────────────────────────────────────────

def generate_study_plan(
    exam_type: str,
    current_level: str,
    target_score: str,
    weeks_count: int,
    daily_minutes: int,
) -> StudyPlanResponse:
    model = _get_utils_model()
    prompt = (
        f"Create a {weeks_count}-week French study plan for a {exam_type} exam candidate.\n"
        f"Current CEFR level: {current_level}. Target: {target_score}.\n"
        f"Available study time: {daily_minutes} minutes per day.\n\n"
        "Return a JSON object matching this schema exactly:\n"
        "{\n"
        '  "weeklyBreakdown": [{ "weekNumber": int, "theme": str, "mainGoal": str,\n'
        '    "dailyTasks": { "Monday": str, "Tuesday": str, "Wednesday": str,\n'
        '      "Thursday": str, "Friday": str, "Saturday": str, "Sunday": str },\n'
        '    "tips": str }],\n'
        '  "expertAdvice": str,\n'
        '  "prioritySkillsToBuild": [str]\n'
        "}"
    )
    result = model.generate_content(prompt)
    return StudyPlanResponse.model_validate_json(result.text)


# ─── Vocab explain ─────────────────────────────────────────────────────────────

def explain_vocab(word: str, translation: str, category: str | None) -> VocabExplainResponse:
    model = _get_utils_model()
    prompt = (
        f"Explain the French word '{word}' (meaning: {translation}"
        + (f", category: {category}" if category else "")
        + ").\n\n"
        "Return a JSON object matching this schema exactly:\n"
        "{\n"
        '  "word": str,\n'
        '  "exampleSentence": str,\n'
        '  "exampleTranslation": str,\n'
        '  "usageTip": str,\n'
        '  "relatedWords": [str]\n'
        "}"
    )
    result = model.generate_content(prompt)
    return VocabExplainResponse.model_validate_json(result.text)


# ─── Writing eval ──────────────────────────────────────────────────────────────

def evaluate_writing(essay: str, prompt: str, exam_type: str) -> AIWritingCorrection:
    model = _get_eval_model()
    user_prompt = (
        f"Exam: {exam_type}\n"
        f"Prompt given to candidate: {prompt}\n\n"
        f"Candidate's essay:\n{essay}\n\n"
        f"Return JSON matching this schema:\n{_WRITING_SCHEMA}"
    )
    result = model.generate_content(user_prompt)
    return AIWritingCorrection.model_validate_json(result.text)


# ─── Speaking eval ─────────────────────────────────────────────────────────────

def evaluate_speaking(
    audio_bytes: bytes,
    audio_mime_type: str,
    prompt: str,
    exam_type: str,
    duration_seconds: int,
) -> AISpeakingSuggestion:
    model = _get_speaking_model()
    audio_part = {
        "inline_data": {
            "mime_type": audio_mime_type,
            "data": base64.b64encode(audio_bytes).decode("utf-8"),
        }
    }
    text_part = (
        f"Exam: {exam_type}\n"
        f"Prompt given to candidate: {prompt}\n"
        f"Recording duration: {duration_seconds} seconds\n\n"
        f"Evaluate the audio recording above.\n"
        f"Return JSON matching this schema:\n{_SPEAKING_SCHEMA}"
    )
    result = model.generate_content([audio_part, text_part])
    return AISpeakingSuggestion.model_validate_json(result.text)
