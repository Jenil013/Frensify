from unittest.mock import MagicMock


def _row(idx: int) -> dict:
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
        "difficulty": "B1",
    }


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
    _mock_rows(mock_db, [_row(i) for i in range(40)])
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=5",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 5


def test_free_tier_reading_clamped_to_15(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    _mock_rows(mock_db, [_row(i) for i in range(68)])
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=40",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 15


def test_pro_tier_reading_not_clamped(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Pro"
    _mock_rows(mock_db, [_row(i) for i in range(68)])
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-ecrite&limit=40",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 40
