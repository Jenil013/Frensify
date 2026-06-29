from unittest.mock import MagicMock

from routers.questions import TCF_READING_DIFFICULTY_BANDS, TEF_READING_DIFFICULTY_BANDS


def _row(idx: int, *, difficulty: str = "B1") -> dict:
    return {
        "id": f"q-{idx}",
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


def _mock_rows(mock_db, rows):
    (
        mock_db.table.return_value.select.return_value.eq.return_value.eq
        .return_value.execute.return_value
    ) = MagicMock(data=rows)


def test_returns_mapped_camelcase_shape(client, auth_headers, mock_db):
    _mock_rows(mock_db, [_row(1)])
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
    _mock_rows(mock_db, _tef_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=5",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 5


def test_free_tier_reading_clamped_to_15(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    _mock_rows(mock_db, _tef_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=40",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 15


def test_pro_tier_reading_not_clamped(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Pro"
    _mock_rows(mock_db, _tef_reading_pool())
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
    _mock_rows(mock_db, [_row(1)])
    client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite",
        headers=auth_headers,
    )
    mock_db.table.assert_called_with("reading_questions")


def test_tef_reading_follows_difficulty_bands(client, auth_headers, mock_db):
    _mock_rows(mock_db, _tef_reading_pool())
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


def test_tef_reading_free_tier_starts_with_lower_bands(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    _mock_rows(mock_db, _tef_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=40",
        headers=auth_headers,
    )
    body = response.json()
    assert len(body) == 15
    assert [item["difficulty"] for item in body[:13]] == ["A1"] * 13
    assert [item["difficulty"] for item in body[13:]] == ["A2"] * 2


def test_tcf_reading_follows_difficulty_bands(client, auth_headers, mock_db):
    _mock_rows(mock_db, _tcf_reading_pool())
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


def test_tcf_reading_free_tier_starts_with_lower_bands(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    _mock_rows(mock_db, _tcf_reading_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-ecrite&limit=39",
        headers=auth_headers,
    )
    body = response.json()
    assert len(body) == 15
    assert [item["difficulty"] for item in body[:13]] == ["A1"] * 13
    assert [item["difficulty"] for item in body[13:]] == ["A2"] * 2
