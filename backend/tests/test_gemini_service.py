import json
from unittest.mock import patch, MagicMock
from services.gemini_service import generate_study_plan, explain_vocab, evaluate_writing, evaluate_speaking


_PLAN_JSON = json.dumps({
    "weeklyBreakdown": [{
        "weekNumber": 1,
        "theme": "Foundations",
        "mainGoal": "Build B1 vocabulary",
        "dailyTasks": {
            "Monday": "Vocab drill 20 words",
            "Tuesday": "TCF reading passage",
            "Wednesday": "Listening comprehension",
            "Thursday": "Essay practice",
            "Friday": "Grammar review",
            "Saturday": "Mock MCQ set",
            "Sunday": "Rest and review",
        },
        "tips": "Focus on connectors.",
    }],
    "expertAdvice": "Consistency is key.",
    "prioritySkillsToBuild": ["Listening", "Writing"],
})

_VOCAB_JSON = json.dumps({
    "word": "bonjour",
    "exampleSentence": "Bonjour, comment allez-vous?",
    "exampleTranslation": "Hello, how are you?",
    "usageTip": "Use in formal and informal settings.",
    "relatedWords": ["salut", "bonsoir"],
})

_WRITING_JSON = json.dumps({
    "cefrScore": "B2",
    "scoreRange": "B1-B2",
    "overallFeedback": "Good structure and vocabulary.",
    "dimensionScores": {
        "vocabulary": "B2",
        "grammar": "B1",
        "coherence": "B2",
        "taskCompleteness": "B2",
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


@patch("services.gemini_service.genai.GenerativeModel")
def test_generate_study_plan(MockModel):
    instance = MagicMock()
    MockModel.return_value = instance
    instance.generate_content.return_value = MagicMock(text=_PLAN_JSON)

    result = generate_study_plan(
        exam_type="TCF",
        current_level="B1",
        target_score="B2",
        weeks_count=4,
        daily_minutes=45,
    )
    assert result.weeklyBreakdown[0].weekNumber == 1
    assert "Listening" in result.prioritySkillsToBuild


@patch("services.gemini_service.genai.GenerativeModel")
def test_explain_vocab(MockModel):
    instance = MagicMock()
    MockModel.return_value = instance
    instance.generate_content.return_value = MagicMock(text=_VOCAB_JSON)

    result = explain_vocab(word="bonjour", translation="hello", category="greetings")
    assert result.word == "bonjour"
    assert "salut" in result.relatedWords


@patch("services.gemini_service.genai.GenerativeModel")
def test_evaluate_writing_returns_correction(MockModel):
    instance = MagicMock()
    MockModel.return_value = instance
    instance.generate_content.return_value = MagicMock(text=_WRITING_JSON)

    result = evaluate_writing(
        essay="Je suis alle au marche ce matin.",
        prompt="Decrivez une journee typique.",
        exam_type="TCF",
    )
    assert result.cefrScore == "B2"
    assert len(result.detailedCorrections) == 1


@patch("services.gemini_service.genai.GenerativeModel")
def test_evaluate_speaking_returns_suggestion(MockModel):
    instance = MagicMock()
    MockModel.return_value = instance
    instance.generate_content.return_value = MagicMock(text=_SPEAKING_JSON)

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
