import json
import re
from typing import TypeVar

from google import genai
from google.genai import types

from config import GEMINI_EVAL_MODEL, GEMINI_UTILS_MODEL, settings
from models.ai import (
    AIWritingCorrection,
    AISpeakingSuggestion,
    VocabExplainResponse,
)


# ─── System prompts ────────────────────────────────────────────────────────────

_WRITING_SYSTEM = """You are a strict but fair French writing examiner for the TEF or TCF exam.
You evaluate one written response exactly as a trained CEFR-based examiner would, using
the official criteria for Expression Écrite.

The user message provides the exam context (exam type, task, prompt, word count, and
candidate text). Judge the response ONLY against that task and the text the candidate
actually wrote. Never invent missing content.

=== EXAM FORMAT DIFFERENCES (apply the right one) ===
- TEF Expression Écrite: 2 tasks (a practical/message task and an argumentative
  task). Reported on a CEFR scale A1–C2.
- TCF Expression Écrite: 3 tasks (a short message, an opinion piece, and an
  opinion-with-summary). Reported on a 0–20 scale that maps to CEFR.
The task types differ in expected register, length, and structure, so weight
"task completion" against THIS specific task, not a generic essay.

=== CEFR STANDARDS ===
- A1/A2: very basic language, frequent errors, limited control, weak structure.
- B1: meaning generally clear; simple organization; basic but functional
  vocabulary; noticeable errors that don't fully block communication.
- B2: clearly developed; good task completion; logical organization; varied
  vocabulary and grammar; errors present but don't impede communication.
- C1: strong, flexible control; well-structured argument; few errors; precise
  vocabulary.
- C2: near-native control; highly accurate; elegant; fully appropriate to task.

=== SCORING DIMENSIONS (rate each, then derive the overall level) ===
1. taskCompleteness: did they answer the prompt fully, follow the required
   format/register, meet the word count, and stay relevant?
2. coherence: paragraphing, logical flow, connectors, readability.
3. vocabulary: range, appropriateness, precision, lexical control.
4. grammar: sentence variety, accuracy, tense control, agreement, syntax.

=== EVALUATION RULES ===
- Be strict and consistent.
- Penalize: incomplete or off-topic responses, missing the word count, wrong
  register/format for the task, weak structure, repetition, unnatural phrasing,
  major grammar/spelling errors.
- Reward: clear argumentation, relevant examples, logical sequencing, accurate
  use of varied vocabulary and grammar, register appropriate to the task.
- Don't over-reward length. A long but weak response still scores low.
- Don't under-score minor mistakes if the message stays clear.
- If the text mixes levels, choose the most defensible overall level.
- If borderline between two levels, set cefrScore to the LOWER level and show
  both in scoreRange.

=== CALIBRATION ANCHORS (reference points, do not score these) ===
B1 anchor (message task) — clear, simple, functional, limited range:
"Salut Marie, samedi dernier je suis allé à un concert dans ma ville. J'ai
beaucoup aimé parce que les musiciens étaient très bons et l'ambiance était
super. Après, j'ai mangé avec mes amis. Je pense que tu vas aimer ce genre
d'événement. Tu veux venir la prochaine fois ? À bientôt."
→ B1: communicates clearly with simple connectors (parce que, après); basic
   vocabulary; little syntactic range; no real development.

B2 anchor (argumentative task) — developed, structured, varied, mostly accurate:
"De nos jours, le télétravail suscite de nombreux débats. D'une part, il offre
une plus grande flexibilité ; d'autre part, il peut entraîner un isolement et
brouiller la frontière entre vie professionnelle et vie privée. Pour ma part, je
considère que c'est une évolution positive, à condition qu'elle soit encadrée.
En effet, les entreprises devraient instaurer des règles claires afin de
préserver l'équilibre de leurs employés."
→ B2: clear structure; varied connectors (d'une part… d'autre part, en effet);
   controlled subjunctive; precise vocabulary; a genuine, developed argument.

=== OUTPUT (return ONLY valid JSON, keys in EXACTLY this order) ===
1. "analysis": Reason through all four dimensions first, citing specific
   evidence from the candidate's text. Write this BEFORE deciding any score.
2. "overallFeedback": 2–4 sentences of learner-facing feedback — main strengths
   and the most important things to improve. Encouraging but honest.
3. "cefrScore": the single most defensible level (A1–C2). If borderline, use
   the LOWER level.
4. "scoreRange": the plausible span, e.g. "B1-B2". If not borderline, repeat
   the level, e.g. "B2".
5. "dimensionScores": object with "vocabulary", "grammar", "coherence",
   "taskCompleteness". Each value is a string formatted as
   "LEVEL — one-sentence justification".
6. "detailedCorrections": the most impactful errors only (max ~6), each as
   { "original", "corrected", "explanation" }. Explanations in plain terms.
7. "improvedVersion": a rewrite of the candidate's text that keeps their ideas
   and respects the required task format, but fixes the errors and raises it to
   a strong example for their target level. Do not add substantive new content
   beyond what's needed to fix and elevate.

Output ONLY the JSON object. No markdown, no backticks, no commentary, no text
before or after. If uncertain, make the best grounded judgment and reflect it
in "analysis" and "scoreRange"."""

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
  "analysis": "string",
  "overallFeedback": "string",
  "cefrScore": "string (e.g. B2)",
  "scoreRange": "string (e.g. B1-B2)",
  "dimensionScores": {
    "vocabulary": "string (LEVEL — justification)",
    "grammar": "string (LEVEL — justification)",
    "coherence": "string (LEVEL — justification)",
    "taskCompleteness": "string (LEVEL — justification)"
  },
  "detailedCorrections": [
    { "original": "string", "corrected": "string", "explanation": "string" }
  ],
  "improvedVersion": "string"
}"""


def _build_writing_user_prompt(
    *,
    exam_type: str,
    task_number: str,
    task_prompt: str,
    min_words: int,
    candidate_text: str,
) -> str:
    return (
        "=== EXAM CONTEXT ===\n"
        f"- Exam: {exam_type}\n"
        f"- Task number / type: {task_number}\n"
        "- The exact task instructions the candidate was given:\n"
        "<<<\n"
        f"{task_prompt}\n"
        ">>>\n"
        f"- Minimum required word count: {min_words}\n"
        "- The candidate's response:\n"
        "<<<\n"
        f"{candidate_text}\n"
        ">>>\n\n"
        f"Return JSON matching this schema (keys in exactly this order):\n{_WRITING_SCHEMA}"
    )

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


T = TypeVar("T")


def _strip_code_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, count=1)
        cleaned = re.sub(r"\s*```\s*$", "", cleaned)
    return cleaned.strip()


def _parse_json_payload(text: str) -> dict:
    """Parse the first JSON object, ignoring trailing model noise."""
    cleaned = _strip_code_fence(text)
    try:
        payload, _end = json.JSONDecoder().raw_decode(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Gemini returned invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError("Gemini JSON response must be an object.")
    return payload


def _load_model(text: str, model_cls: type[T]) -> T:
    return model_cls.model_validate(_parse_json_payload(text))


def _generate_json(
    *,
    model: str,
    api_key: str,
    contents: str | list,
    system_instruction: str | None = None,
) -> str:
    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        system_instruction=system_instruction,
    )
    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=config,
    )
    if not response.text:
        raise ValueError("Gemini returned an empty response.")
    return response.text


_VOCAB_SYSTEM = """You are a TEF/TCF French exam vocabulary specialist.
Explain one French word or phrase for an exam candidate preparing for TEF Canada or TCF.

Be concise, examiner-like, and exam-oriented — not chatty.
Estimate CEFR difficulty honestly (A1–C2).
Explain when the expression helps on TEF vs TCF tasks (writing argumentation, oral interaction).
Provide natural example sentences at the learner's level.
Return ONLY valid JSON with no markdown."""


def explain_vocab(
    word: str,
    translation: str | None,
    category: str | None,
    exam_type: str | None = None,
) -> VocabExplainResponse:
    exam_ctx = f" Candidate target exam: {exam_type}." if exam_type else ""
    meaning = f"English meaning: {translation}." if translation else "Infer the English meaning."
    category_ctx = f" Category hint: {category}." if category else ""
    prompt = (
        f"French expression: {word}\n{meaning}{category_ctx}{exam_ctx}\n\n"
        "Return a JSON object with EXACTLY these keys:\n"
        "{\n"
        '  "word": str,\n'
        '  "translation": str,\n'
        '  "difficulty": str (CEFR level A1–C2),\n'
        '  "explanation": str (1–2 sentences on usage and register),\n'
        '  "examSignificance": str (1–2 sentences: TEF/TCF task relevance),\n'
        '  "examples": [{"french": str, "english": str}, {"french": str, "english": str}],\n'
        '  "synonyms": [str],\n'
        '  "exampleSentence": str (first example french),\n'
        '  "exampleTranslation": str (first example english),\n'
        '  "usageTip": str (one actionable tip for next practice),\n'
        '  "relatedWords": [str]\n'
        "}"
    )
    result = _generate_json(
        model=GEMINI_UTILS_MODEL,
        api_key=settings.gemini_api_key_utils,
        contents=prompt,
        system_instruction=_VOCAB_SYSTEM,
    )
    parsed = _load_model(result, VocabExplainResponse)
    if translation and not parsed.translation:
        return parsed.model_copy(update={"translation": translation})
    return parsed


# ─── Writing eval ──────────────────────────────────────────────────────────────

def evaluate_writing(
    essay: str,
    prompt: str,
    exam_type: str,
    *,
    task_number: str | None = None,
    min_words: int | None = None,
) -> AIWritingCorrection:
    resolved_task = task_number or f"{exam_type} writing task"
    resolved_min_words = min_words if min_words is not None else 0
    user_prompt = _build_writing_user_prompt(
        exam_type=exam_type,
        task_number=resolved_task,
        task_prompt=prompt,
        min_words=resolved_min_words,
        candidate_text=essay,
    )
    result = _generate_json(
        model=GEMINI_EVAL_MODEL,
        api_key=settings.gemini_api_key_eval,
        contents=user_prompt,
        system_instruction=_WRITING_SYSTEM,
    )
    return _load_model(result, AIWritingCorrection)


# ─── Speaking eval ─────────────────────────────────────────────────────────────

def evaluate_speaking(
    audio_bytes: bytes,
    audio_mime_type: str,
    prompt: str,
    exam_type: str,
    duration_seconds: int,
) -> AISpeakingSuggestion:
    text_part = (
        f"Exam: {exam_type}\n"
        f"Prompt given to candidate: {prompt}\n"
        f"Recording duration: {duration_seconds} seconds\n\n"
        f"Evaluate the audio recording above.\n"
        f"Return JSON matching this schema:\n{_SPEAKING_SCHEMA}"
    )
    contents = [
        types.Part.from_bytes(data=audio_bytes, mime_type=audio_mime_type),
        text_part,
    ]
    result = _generate_json(
        model=GEMINI_EVAL_MODEL,
        api_key=settings.gemini_api_key_eval,
        contents=contents,
        system_instruction=_SPEAKING_SYSTEM,
    )
    return _load_model(result, AISpeakingSuggestion)
