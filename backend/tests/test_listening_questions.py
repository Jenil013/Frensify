from unittest.mock import MagicMock


def _listening_row(idx: int, *, with_image: bool = False) -> dict:
    return {
        "id": f"q-{idx}",
        "exam_type": "TCF",
        "module_id": "comprehension-orale",
        "prompt": f"Listening question {idx}?",
        "audio_path": f"audio/{idx}.mp3",
        "image_path": f"images/{idx}.png" if with_image else None,
        "choices": ["A", "B", "C", "D"],
        "correct_index": 0,
        "explanation": None,
        "difficulty": "B1",
    }


def _mock_rows(mock_db, rows):
    (
        mock_db.table.return_value.select.return_value.eq.return_value.eq
        .return_value.execute.return_value
    ) = MagicMock(data=rows)


def test_listening_puts_image_questions_first_tcf(client, auth_headers, mock_db):
    rows = [_listening_row(i, with_image=i <= 3) for i in range(1, 45)]
    _mock_rows(mock_db, rows)
    response = client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-orale&limit=39",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 39
    assert all(item["imageUrl"] for item in body[:3])
    assert not body[3]["imageUrl"]


def test_listening_queries_listening_questions_table(client, auth_headers, mock_db):
    rows = [_listening_row(i, with_image=i <= 3) for i in range(1, 45)]
    _mock_rows(mock_db, rows)
    client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-orale&limit=39",
        headers=auth_headers,
    )
    mock_db.table.assert_called_with("listening_questions")


def test_listening_puts_image_questions_first_tef(client, auth_headers, mock_db):
    rows = [
        {
            **_listening_row(i, with_image=i <= 4),
            "exam_type": "TEF",
        }
        for i in range(1, 46)
    ]
    _mock_rows(mock_db, rows)
    response = client.get(
        "/api/v1/questions?exam_type=TEF&module_id=comprehension-orale&limit=40",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 40
    assert all(item["imageUrl"] for item in body[:4])
    assert not body[4]["imageUrl"]
