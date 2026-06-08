from unittest.mock import patch, MagicMock
from datetime import date, timedelta
from models.ai import AIWritingCorrection, AISpeakingSuggestion

_WRITING_FEEDBACK = AIWritingCorrection(
    analysis="Clear structure with some grammar gaps.",
    overallFeedback="Good.",
    cefrScore="B2",
    scoreRange="B1-B2",
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

_TCF_MODULE_PAYLOAD = {
    "module_id": "expression-ecrite",
    "exam_type": "TCF",
    "sections": [
        {
            "section_id": "1",
            "prompt": "Decrivez votre ville.",
            "essay_text": "Ma ville est belle.",
            "word_count": 4,
        },
        {
            "section_id": "2",
            "prompt": "Ecrivez une lettre.",
            "essay_text": "Cher ami, je vous ecris.",
            "word_count": 5,
        },
        {
            "section_id": "3",
            "prompt": "Argumentez.",
            "essay_text": "Je pense que c'est important.",
            "word_count": 5,
        },
    ],
}


def _setup_cap_mock(mock_db):
    """Configure mock_db so the weekly_usage cap check returns no row (under cap)."""
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value \
        .execute.return_value = MagicMock(data=[])


def _setup_cap_at_limit(mock_db, endpoint: str, cap: int):
    monday = date.today() - timedelta(days=date.today().weekday())
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value \
        .execute.return_value = MagicMock(
            data=[{"user_id": "user-uuid-123", "week_start": monday.isoformat(), f"{endpoint}_count": cap}]
        )


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


def test_speaking_upload_url(client, auth_headers, mock_profile):
    with patch("supabase.create_client") as mock_create:
        mock_storage = MagicMock()
        mock_storage.from_.return_value.create_signed_upload_url.return_value = {
            "signed_url": "https://example.supabase.co/upload/signed?token=abc",
            "token": "abc",
            "path": f"{mock_profile['id']}/test.webm",
        }
        mock_create.return_value.storage = mock_storage
        response = client.post(
            "/api/v1/ai/speaking/upload-url",
            headers=auth_headers,
        )
    assert response.status_code == 200
    body = response.json()
    assert body["upload_url"].startswith("https://example.supabase.co")
    assert body["storage_path"].endswith(".webm")


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


def test_writing_module_practice(client, auth_headers, mock_db):
    _setup_cap_mock(mock_db)
    with patch("routers.ai.evaluate_writing", return_value=_WRITING_FEEDBACK) as mock_eval, \
         patch("routers.ai.write_audit_log") as mock_audit, \
         patch("routers.ai.increment") as mock_increment:
        mock_db.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
        response = client.post(
            "/api/v1/ai/writing/module",
            headers=auth_headers,
            json=_TCF_MODULE_PAYLOAD,
        )
    assert response.status_code == 200
    body = response.json()
    assert len(body["sections"]) == 3
    assert all(s["feedback"]["cefrScore"] == "B2" for s in body["sections"])
    assert mock_eval.call_count == 3
    mock_increment.assert_called_once()
    mock_audit.assert_called_once()


def test_writing_module_wrong_section_count(client, auth_headers, mock_db):
    _setup_cap_mock(mock_db)
    payload = {**_TCF_MODULE_PAYLOAD, "sections": _TCF_MODULE_PAYLOAD["sections"][:2]}
    response = client.post(
        "/api/v1/ai/writing/module",
        headers=auth_headers,
        json=payload,
    )
    assert response.status_code == 422


def test_writing_module_practice_cap_exceeded(client, auth_headers, mock_db):
    _setup_cap_at_limit(mock_db, "writing_eval", 2)
    response = client.post(
        "/api/v1/ai/writing/module",
        headers=auth_headers,
        json=_TCF_MODULE_PAYLOAD,
    )
    assert response.status_code == 429


_TCF_SPEAKING_MODULE_PAYLOAD = {
    "module_id": "expression-orale",
    "exam_type": "TCF",
    "exercise_id": "oral-combo-1",
    "sections": [
        {
            "section_id": "1",
            "prompt": "Examiner cue: Presentez-vous.",
            "storage_path": "user-uuid-123/a1.webm",
            "duration_seconds": 30,
        },
        {
            "section_id": "2",
            "prompt": "Role-play scenario.",
            "storage_path": "user-uuid-123/a2.webm",
            "duration_seconds": 45,
        },
        {
            "section_id": "3",
            "prompt": "Argument topic.",
            "storage_path": "user-uuid-123/a3.webm",
            "duration_seconds": 60,
        },
    ],
}


def test_speaking_module_practice(client, auth_headers, mock_db):
    _setup_cap_mock(mock_db)
    with patch("routers.ai._run_speaking_eval", return_value=_SPEAKING_FEEDBACK) as mock_eval, \
         patch("routers.ai.write_audit_log") as mock_audit, \
         patch("routers.ai.increment") as mock_increment:
        mock_db.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
        response = client.post(
            "/api/v1/ai/speaking/module",
            headers=auth_headers,
            json=_TCF_SPEAKING_MODULE_PAYLOAD,
        )
    assert response.status_code == 200
    body = response.json()
    assert len(body["sections"]) == 3
    assert all(s["feedback"]["cefrLevel"] == "B1" for s in body["sections"])
    assert mock_eval.call_count == 3
    mock_increment.assert_called_once()
    mock_audit.assert_called_once()


def test_speaking_module_wrong_section_count(client, auth_headers, mock_db):
    _setup_cap_mock(mock_db)
    payload = {
        **_TCF_SPEAKING_MODULE_PAYLOAD,
        "sections": _TCF_SPEAKING_MODULE_PAYLOAD["sections"][:2],
    }
    response = client.post(
        "/api/v1/ai/speaking/module",
        headers=auth_headers,
        json=payload,
    )
    assert response.status_code == 422


def test_writing_module_practice_free_tier(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    _setup_cap_at_limit(mock_db, "writing_eval", 0)
    response = client.post(
        "/api/v1/ai/writing/module",
        headers=auth_headers,
        json=_TCF_MODULE_PAYLOAD,
    )
    assert response.status_code == 429
