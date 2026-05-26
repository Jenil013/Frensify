from unittest.mock import patch, MagicMock
from models.ai import AIWritingCorrection, AISpeakingSuggestion

_WRITING_FEEDBACK = AIWritingCorrection(
    cefrScore="B2",
    scoreRange="B1-B2",
    overallFeedback="Good.",
    dimensionScores={"vocabulary": "B2", "grammar": "B1", "coherence": "B2", "taskCompleteness": "B2"},
    detailedCorrections=[],
    improvedVersion="Improved.",
)

_SPEAKING_FEEDBACK = AISpeakingSuggestion(
    cefrLevel="B1",
    fluencyFeedback="OK.",
    grammarAndVocab="Some errors.",
    structureAnalysis="Good.",
    pronunciationTips=["Watch vowels."],
    suggestedPhrases=[{"french": "En effet", "english": "Indeed", "context": "Agreement"}],
    modelSpokenDraft="En effet...",
)


def _setup_cap_mock(mock_db):
    """Configure mock_db so the weekly_usage cap check returns count=0 (under cap)."""
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value \
        .single.return_value.execute.return_value = MagicMock(data=None)


def test_writing_eval_practice(client, auth_headers, mock_db):
    _setup_cap_mock(mock_db)
    with patch("routers.ai.evaluate_writing", return_value=_WRITING_FEEDBACK), \
         patch("routers.ai.write_audit_log"), \
         patch("routers.ai.increment"):
        mock_db.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
        response = client.post(
            "/api/v1/ai/writing",
            headers=auth_headers,
            json={
                "exercise_id": "ex-1",
                "essay_text": "Je suis alle.",
                "word_count": 4,
                "exam_type": "TCF",
                "prompt": "Decrivez.",
            },
        )
    assert response.status_code == 200
    assert response.json()["cefrScore"] == "B2"


def test_speaking_eval_practice(client, auth_headers, mock_db):
    _setup_cap_mock(mock_db)
    with patch("routers.ai.evaluate_speaking", return_value=_SPEAKING_FEEDBACK), \
         patch("routers.ai._download_audio", return_value=(b"fake-audio", "audio/webm")), \
         patch("routers.ai._delete_audio"), \
         patch("routers.ai.write_audit_log"), \
         patch("routers.ai.increment"):
        mock_db.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
        response = client.post(
            "/api/v1/ai/speaking",
            headers=auth_headers,
            json={
                "exercise_id": "ex-2",
                "storage_path": "user-uuid-123/recording-2026-05-21.webm",
                "duration_seconds": 30,
                "exam_type": "TCF",
                "prompt": "Presentez-vous.",
            },
        )
    assert response.status_code == 200
    assert response.json()["cefrLevel"] == "B1"
