from unittest.mock import MagicMock

import pytest

from config import FREE_SET_DIR
from routers.questions import TCF_READING_DIFFICULTY_BANDS, TEF_READING_DIFFICULTY_BANDS


def _row(idx: int, *, difficulty: str = "B1", row_id: str | None = None) -> dict:
    return {
        "id": row_id or f"q-{idx}",
        "exam_type": "TEF",
        "module_id": "comprehension-ecrite",
        "prompt": f"Question {idx}?",
        "passage": f"Passage {idx}",
        "audio_path": None,
        "choices": ["A texte", "B texte", "C texte", "D texte"],
        "correct_index": idx % 4,
        "explanation": None,
        "difficulty": difficulty,
    }


def _tef_reading_pool(*, copies: int = 3) -> list[dict]:
    rows: list[dict] = []
    idx = 1
    for difficulty, band_size in TEF_READING_DIFFICULTY_BANDS:
        for _ in range(band_size * copies):
            rows.append(_row(idx, difficulty=difficulty))
            idx += 1
    return rows


def _tcf_row(idx: int, *, difficulty: str = "B1") -> dict:
    row = _row(idx, difficulty=difficulty)
    row["exam_type"] = "TCF"
    return row


def _tcf_reading_pool(*, copies: int = 3) -> list[dict]:
    rows: list[dict] = []
    idx = 1
    for difficulty, band_size in TCF_READING_DIFFICULTY_BANDS:
        for _ in range(band_size * copies):
            rows.append(_tcf_row(idx, difficulty=difficulty))
            idx += 1
    return rows


def _mock_pool_rows(mock_db, rows):
    (
        mock_db.table.return_value.select.return_value.eq.return_value.eq
        .return_value.execute.return_value
    ) = MagicMock(data=rows)


def _mock_free_set_rows(mock_db, rows):
    (
        mock_db.table.return_value.select.return_value.in_.return_value.execute.return_value
    ) = MagicMock(data=rows)


@pytest.fixture
def free_set_file(tmp_path, monkeypatch):
    """Point FREE_SET_DIR at a temp file with two question ids."""
    monkeypatch.setattr("config.FREE_SET_DIR", tmp_path)
    monkeypatch.setattr("services.free_sets.FREE_SET_DIR", tmp_path)
    path = tmp_path / "tef_reading_set1.txt"
    path.write_text("q-3\nq-1\nq-2\n", encoding="utf-8")
    return path


def test_returns_mapped_camelcase_shape(client, auth_headers, mock_db):
    _mock_pool_rows(mock_db, [_row(1)])
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite",
        headers=auth_headers,
    )
    assert response.status_code == 200
    item = response.json()[0]
    assert item["id"] == "q-1"
    assert item["prompt"] == "Question 1?"
    assert item["passage"] == "Passage 1"
    assert item["audioUrl"] is None
    assert item["correctChoiceIndex"] == 1
    assert item["choices"] == ["A texte", "B texte", "C texte", "D texte"]
    assert item["difficulty"] == "B1"


def test_respects_limit(client, auth_headers, mock_db):
    _mock_pool_rows(mock_db, _tef_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=5",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 5


def test_free_tier_requires_set(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    _mock_pool_rows(mock_db, _tef_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite",
        headers=auth_headers,
    )
    assert response.status_code == 403


def test_free_tier_returns_frozen_set_in_order(
    client, auth_headers, mock_db, mock_profile, free_set_file
):
    mock_profile["tier"] = "Free"
    rows = [
        _row(1, row_id="q-1"),
        _row(2, row_id="q-2"),
        _row(3, row_id="q-3"),
    ]
    _mock_free_set_rows(mock_db, rows)
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&set=1",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert [item["id"] for item in body] == ["q-3", "q-1", "q-2"]


def test_free_tier_invalid_set_number(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&set=3",
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_pro_tier_reading_not_clamped(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Pro"
    _mock_pool_rows(mock_db, _tef_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=40",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 40


def test_unknown_module_returns_400(client, auth_headers, mock_db):
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=expression-ecrite",
        headers=auth_headers,
    )
    assert response.status_code == 400
    mock_db.table.assert_not_called()


def test_reading_queries_reading_questions_table(client, auth_headers, mock_db):
    _mock_pool_rows(mock_db, [_row(1)])
    client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite",
        headers=auth_headers,
    )
    mock_db.table.assert_called_with("reading_questions")


def test_tef_reading_follows_difficulty_bands(client, auth_headers, mock_db):
    _mock_pool_rows(mock_db, _tef_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=40",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 40

    expected_sequence: list[str] = []
    for difficulty, band_size in TEF_READING_DIFFICULTY_BANDS:
        expected_sequence.extend([difficulty] * band_size)
    assert [item["difficulty"] for item in body] == expected_sequence


def test_tcf_reading_follows_difficulty_bands(client, auth_headers, mock_db):
    _mock_pool_rows(mock_db, _tcf_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-ecrite&limit=39",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 39

    expected_sequence: list[str] = []
    for difficulty, band_size in TCF_READING_DIFFICULTY_BANDS:
        expected_sequence.extend([difficulty] * band_size)
    assert [item["difficulty"] for item in body] == expected_sequence


def test_practice_sets_for_free_tier(client, auth_headers, mock_profile, monkeypatch):
    mock_profile["tier"] = "Free"
    monkeypatch.setattr(
        "routers.questions.count_set_questions",
        lambda exam_type, module_id, set_number: 40,
    )
    response = client.get(
        "/api/v1/practice-sets?exam_type=TEF&module_id=comprehension-ecrite",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0]["set"] == 1
    assert body[0]["label"] == "Sample test 1"
    assert body[0]["questionCount"] == 40


def test_practice_sets_empty_for_pro(client, auth_headers, mock_profile):
    mock_profile["tier"] = "Pro"
    response = client.get(
        "/api/v1/practice-sets?exam_type=TEF&module_id=comprehension-ecrite",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json() == []


def test_committed_free_set_files_exist():
    for name in (
        "tcf_listening_set1.txt",
        "tcf_listening_set2.txt",
        "tcf_reading_set1.txt",
        "tcf_reading_set2.txt",
        "tef_listening_set1.txt",
        "tef_listening_set2.txt",
        "tef_reading_set1.txt",
        "tef_reading_set2.txt",
    ):
        path = FREE_SET_DIR / name
        assert path.is_file(), f"missing {name}"
        ids = [line.strip() for line in path.read_text().splitlines() if line.strip()]
        assert len(ids) >= 39
