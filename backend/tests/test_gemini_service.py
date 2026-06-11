import json
from unittest.mock import patch, MagicMock
from services.gemini_service import (
    explain_vocab,
    evaluate_writing,
    evaluate_speaking,
    _load_model,
)
from models.ai import AIWritingCorrection


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


def test_load_model_tolerates_trailing_json_noise():
    noisy = _WRITING_JSON + "\n\n}"
    result = _load_model(noisy, AIWritingCorrection)
    assert result.cefrScore == "B2"
