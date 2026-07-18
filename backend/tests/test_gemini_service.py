import json
from unittest.mock import patch, MagicMock
from services.gemini_service import (
    explain_vocab,
    evaluate_writing,
    evaluate_speaking,
    evaluate_speaking_conversation,
    generate_oral_turn,
    apply_early_submit_penalty,
    early_submit_downgrade_levels,
    _load_model,
)
from models.ai import AIWritingCorrection, AISpeakingSuggestion, ConversationTurn


_VOCAB_JSON = json.dumps({
    "word": "bonjour",
    "translation": "hello",
    "difficulty": "A1",
    "explanation": "A standard French greeting.",
    "examSignificance": "Useful in TCF oral interview openings.",
    "examples": [
        {"french": "Bonjour, comment allez-vous?", "english": "Hello, how are you?"},
        {"french": "Bonjour madame.", "english": "Good morning, madam."},
    ],
    "synonyms": ["salut"],
    "exampleSentence": "Bonjour, comment allez-vous?",
    "exampleTranslation": "Hello, how are you?",
    "usageTip": "Use in formal and informal settings.",
    "relatedWords": ["salut", "bonsoir"],
})

_WRITING_JSON = json.dumps({
    "analysis": "The response shows B2-level coherence with B1 grammar gaps.",
    "overallFeedback": "Good structure and vocabulary.",
    "cefrScore": "B2",
    "scoreRange": "B1-B2",
    "dimensionScores": {
        "vocabulary": "B2 — varied and appropriate.",
        "grammar": "B1 — agreement errors present.",
        "coherence": "B2 — logical flow.",
        "taskCompleteness": "B2 — prompt addressed.",
    },
    "detailedCorrections": [
        {"original": "je suis alle", "corrected": "je suis alle(e)", "explanation": "Gender agreement."}
    ],
    "improvedVersion": "Je suis alle(e) au marche ce matin.",
})

_SPEAKING_FEEDBACK = AISpeakingSuggestion(
    cefrLevel="B2",
    fluencyFeedback="OK.",
    grammarAndVocab="Some errors.",
    structureAnalysis="Good.",
    pronunciationTips=["Watch vowels."],
    suggestedPhrases=[{"french": "En effet", "english": "Indeed", "context": "Agreement"}],
    modelSpokenDraft="En effet...",
)


def test_early_submit_downgrade_levels():
    assert early_submit_downgrade_levels(300, 0) == 0
    assert early_submit_downgrade_levels(300, 30) == 0
    assert early_submit_downgrade_levels(300, 60) == 1
    assert early_submit_downgrade_levels(300, 180) == 2


def test_apply_early_submit_penalty_downgrades_cefr():
    penalized = apply_early_submit_penalty(_SPEAKING_FEEDBACK, 300, 180)
    assert penalized.cefrLevel == "A2"
    assert "ended this section early" in penalized.structureAnalysis


def test_apply_early_submit_penalty_skips_when_time_used():
    unchanged = apply_early_submit_penalty(_SPEAKING_FEEDBACK, 300, 0)
    assert unchanged.cefrLevel == "B2"


_SPEAKING_JSON = json.dumps({
    "cefrLevel": "B1",
    "fluencyFeedback": "Good pace, some hesitations.",
    "grammarAndVocab": "Minor agreement errors.",
    "structureAnalysis": "Clear introduction, weak conclusion.",
    "pronunciationTips": ["Watch nasal vowels -- 'un' vs 'on'."],
    "suggestedPhrases": [
        {"french": "En effet", "english": "Indeed", "context": "Expressing agreement"}
    ],
    "modelSpokenDraft": "En effet, je pense que les transports en commun sont essentiels.",
})


@patch("services.gemini_service._generate_json", return_value=_VOCAB_JSON)
def test_explain_vocab(mock_generate):
    result = explain_vocab(
        word="bonjour",
        translation="hello",
        category="greetings",
        exam_type="TCF",
    )
    assert result.word == "bonjour"
    assert result.difficulty == "A1"
    assert result.examSignificance
    assert len(result.examples) == 2
    assert "salut" in result.relatedWords
    mock_generate.assert_called_once()


@patch("services.gemini_service._generate_json", return_value=_WRITING_JSON)
def test_evaluate_writing_returns_correction(mock_generate):
    result = evaluate_writing(
        essay="Je suis alle au marche ce matin.",
        prompt="Decrivez une journee typique.",
        exam_type="TCF",
        task_number="TCF Task 1 (short message)",
        min_words=60,
    )
    assert result.cefrScore == "B2"
    assert result.analysis
    assert len(result.detailedCorrections) == 1
    mock_generate.assert_called_once()
    user_prompt = mock_generate.call_args.kwargs["contents"]
    assert "TCF Task 1 (short message)" in user_prompt
    assert "Minimum required word count: 60" in user_prompt
    assert mock_generate.call_args.kwargs["system_instruction"] is not None


@patch("services.gemini_service._generate_json", return_value=_SPEAKING_JSON)
def test_evaluate_speaking_returns_suggestion(mock_generate):
    fake_audio = b"fake-audio-bytes"
    result = evaluate_speaking(
        audio_bytes=fake_audio,
        audio_mime_type="audio/webm",
        prompt="Presentez-vous en deux minutes.",
        exam_type="TCF",
        duration_seconds=90,
    )
    assert result.cefrLevel == "B1"
    assert "nasal" in result.pronunciationTips[0]
    mock_generate.assert_called_once()
    contents = mock_generate.call_args.kwargs["contents"]
    assert isinstance(contents, list)
    assert len(contents) == 2


_ORAL_TURN_JSON = json.dumps({
    "userTranscript": "Je m'appelle Paul.",
    "examinerReplyFr": "Enchanté. D'où venez-vous ?",
})


@patch("services.gemini_service._generate_json", return_value=_ORAL_TURN_JSON)
def test_generate_oral_turn_returns_transcript_and_reply(mock_generate):
    transcript, reply = generate_oral_turn(
        b"audio",
        "audio/webm",
        exam_type="TCF",
        section_id="1",
        prompt="Interview",
        stimulus="Présentez-vous",
        history=[ConversationTurn(role="examiner", text="Présentez-vous")],
    )
    assert transcript == "Je m'appelle Paul."
    assert reply.startswith("Enchanté")
    mock_generate.assert_called_once()


@patch("services.gemini_service._generate_json", return_value=_ORAL_TURN_JSON)
def test_generate_oral_turn_tcf_task2_uses_role_play_reply_mode(mock_generate):
    generate_oral_turn(
        b"audio",
        "audio/webm",
        exam_type="TCF",
        section_id="2",
        prompt="Role-play",
        stimulus="Annonce : cours de français",
        history=[
            ConversationTurn(role="examiner", text="Annonce : cours de français"),
            ConversationTurn(role="user", text="Quels sont les horaires ?"),
        ],
    )
    text_part = mock_generate.call_args.kwargs["contents"][1]
    assert "candidate-led information role-play" in text_part
    assert "ONLY answer" in text_part
    assert "no questions of any kind" in text_part
    system = mock_generate.call_args.kwargs["system_instruction"]
    assert "candidate leads" in system
    assert "never ask the candidate a question" in system


@patch("services.gemini_service._generate_json", return_value=_SPEAKING_JSON)
def test_evaluate_speaking_conversation_returns_suggestion(mock_generate):
    result = evaluate_speaking_conversation(
        [(b"clip1", "audio/webm"), (b"clip2", "audio/webm")],
        prompt="Role-play",
        stimulus="Annonce",
        exam_type="TEF",
        conversation=[
            ConversationTurn(role="examiner", text="Bonjour"),
            ConversationTurn(role="user", text="Quel est le prix ?"),
        ],
        duration_seconds=45,
        allocated_seconds=300,
        seconds_remaining=0,
    )
    assert result.cefrLevel == "B1"
    contents = mock_generate.call_args.kwargs["contents"]
    assert len(contents) >= 4


@patch("services.gemini_service._generate_json", return_value=_SPEAKING_JSON)
def test_evaluate_speaking_conversation_applies_early_submit_penalty(mock_generate):
    result = evaluate_speaking_conversation(
        [(b"clip1", "audio/webm")],
        prompt="Role-play",
        stimulus="Annonce",
        exam_type="TEF",
        conversation=[
            ConversationTurn(role="examiner", text="Bonjour"),
            ConversationTurn(role="user", text="Bonjour"),
        ],
        duration_seconds=20,
        allocated_seconds=300,
        seconds_remaining=200,
    )
    assert result.cefrLevel == "A1"
    assert "ended this section early" in result.structureAnalysis


def test_load_model_tolerates_trailing_json_noise():
    noisy = _WRITING_JSON + "\n\n}"
    result = _load_model(noisy, AIWritingCorrection)
    assert result.cefrScore == "B2"
