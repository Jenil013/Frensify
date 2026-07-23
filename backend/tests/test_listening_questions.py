from unittest.mock import MagicMock

from routers.questions import TCF_LISTENING_DIFFICULTY_BANDS


def _listening_row(
    idx: int,
    *,
    with_image: bool = False,
    difficulty: str = "B1",
    exam_type: str = "TCF",
) -> dict:
    return {
        "id": f"q-{idx}",
        "exam_type": exam_type,
        "module_id": "comprehension-orale",
        "prompt": f"Listening question {idx}?",
        "audio_path": f"audio/{idx}.mp3",
        "image_path": f"images/{idx}.png" if with_image else None,
        "choices": ["A", "B", "C", "D"],
        "correct_index": 0,
        "explanation": None,
        "difficulty": difficulty,
    }


def _tcf_listening_pool(*, copies: int = 3) -> list[dict]:
    """Enough items per CEFR band, with surplus A1 images for the front slots."""
    rows: list[dict] = []
    idx = 1
    for band_index, (difficulty, band_size) in enumerate(TCF_LISTENING_DIFFICULTY_BANDS):
        for copy in range(band_size * copies):
            with_image = band_index == 0 and copy < band_size * copies // 2
            rows.append(
                _listening_row(idx, with_image=with_image, difficulty=difficulty)
            )
            idx += 1
    return rows


def _mock_rows(mock_db, rows):
    (
        mock_db.table.return_value.select.return_value.eq.return_value.eq
        .return_value.execute.return_value
    ) = MagicMock(data=rows)


def test_listening_puts_image_questions_first_tcf(client, auth_headers, mock_db):
    rows = _tcf_listening_pool()
    _mock_rows(mock_db, rows)
    response = client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-orale&limit=39",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 39
    assert all(item["imageUrl"] for item in body[:3])
    assert body[3]["difficulty"] == "A1"


def test_tcf_listening_follows_difficulty_bands(client, auth_headers, mock_db):
    _mock_rows(mock_db, _tcf_listening_pool())
    response = client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-orale&limit=39",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 39

    expected_sequence: list[str] = []
    for difficulty, band_size in TCF_LISTENING_DIFFICULTY_BANDS:
        expected_sequence.extend([difficulty] * band_size)
    assert [item["difficulty"] for item in body] == expected_sequence
    assert all(item["imageUrl"] for item in body[:3])


def test_listening_queries_listening_questions_table(client, auth_headers, mock_db):
    rows = _tcf_listening_pool()
    _mock_rows(mock_db, rows)
    client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-orale&limit=39",
        headers=auth_headers,
    )
    mock_db.table.assert_called_with("listening_questions")


def test_listening_puts_image_questions_first_tef(client, auth_headers, mock_db):
    rows = [
        _listening_row(i, with_image=i <= 4, exam_type="TEF")
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


def test_free_tier_tcf_listening_preserves_frozen_exam_order(
    client, auth_headers, mock_db, mock_profile, tmp_path, monkeypatch
):
    """Free sets are frozen ID lists; file order must already match exam shape."""
    from services.question_sampling import sample_tcf_listening_rows

    mock_profile["tier"] = "Free"
    pool = _tcf_listening_pool(copies=4)
    ordered = sample_tcf_listening_rows(pool, 39)
    path = tmp_path / "tcf_listening_set1.txt"
    path.write_text("\n".join(row["id"] for row in ordered) + "\n", encoding="utf-8")
    monkeypatch.setattr("config.FREE_SET_DIR", tmp_path)
    monkeypatch.setattr("services.free_sets.FREE_SET_DIR", tmp_path)

    _mock_rows = (
        mock_db.table.return_value.select.return_value.in_.return_value.execute.return_value
    )
    _mock_rows.data = ordered

    response = client.get(
        "/api/v1/questions?exam_type=TCF&module_id=comprehension-orale&set=1",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert [item["id"] for item in body] == [row["id"] for row in ordered]
    assert [item["difficulty"] for item in body] == [
        d for d, n in TCF_LISTENING_DIFFICULTY_BANDS for _ in range(n)
    ]
    assert all(item["imageUrl"] for item in body[:3])
