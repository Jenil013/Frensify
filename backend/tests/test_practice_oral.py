from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from content.tcf_oral_task1 import TCF_TASK1_FOLLOWUPS
from routers.practice import _build_tcf_oral_from_pool, _build_tef_oral_from_pool


def _task2_row(row_id: str, stimulus: str) -> dict:
    return {
        "id": row_id,
        "combination_index": 1,
        "title": "TCF Expression orale — Tâche 2 — Q1",
        "tasks": [
            {
                "section_id": "2",
                "prompt": "Role-play prompt",
                "stimulus": stimulus,
            }
        ],
    }


def _task3_row(row_id: str, stimulus: str) -> dict:
    return {
        "id": row_id,
        "combination_index": 2,
        "title": "TCF Expression orale — Tâche 3 — Q1",
        "tasks": [
            {
                "section_id": "3",
                "prompt": "Argument prompt",
                "stimulus": stimulus,
            }
        ],
    }


def test_build_tcf_oral_from_pool_has_three_sections():
    rows = [
        _task2_row("t2-a", "Scenario A"),
        _task2_row("t2-b", "Scenario B"),
        _task3_row("t3-a", "Sujet : Topic A"),
        _task3_row("t3-b", "Sujet : Topic B"),
    ]
    def _mock_choice(pool):
        if pool and isinstance(pool[0], dict) and "fr" in pool[0]:
            return TCF_TASK1_FOLLOWUPS[2]
        return pool[1]

    with patch("random.choice", side_effect=_mock_choice):
        combo = _build_tcf_oral_from_pool(rows)

    assert set(combo.sections.keys()) == {"1", "2", "3"}
    assert "Présentez-vous" in combo.sections["1"].stimulus
    assert TCF_TASK1_FOLLOWUPS[2]["fr"] not in combo.sections["1"].stimulus
    assert combo.sections["2"].stimulus == "Scenario B"
    assert combo.sections["3"].stimulus == "Sujet : Topic B"
    assert combo.id == "task1-hobbies+t2-b+t3-b"


def test_build_tcf_oral_from_pool_empty_raises():
    with pytest.raises(HTTPException) as exc:
        _build_tcf_oral_from_pool([_task2_row("t2", "Only task 2")])
    assert exc.value.status_code == 404


def test_build_tef_oral_from_pool_has_two_sections():
    rows = [
        {
            "id": "a-1",
            "combination_index": 1,
            "title": "TEF Expression orale — Section A — Q1",
            "tasks": [
                {
                    "section_id": "A",
                    "prompt": "Section A prompt",
                    "stimulus": "Situation : Demander des renseignements à une banque.",
                }
            ],
        },
        {
            "id": "b-1",
            "combination_index": 39,
            "title": "TEF Expression orale — Section B — Q1",
            "tasks": [
                {
                    "section_id": "B",
                    "prompt": "Section B prompt",
                    "stimulus": "Situation : Convaincre un ami d'assister à un spectacle d'opéra.",
                }
            ],
        },
    ]
    combo = _build_tef_oral_from_pool(rows)
    assert set(combo.sections.keys()) == {"A", "B"}
    assert "banque" in combo.sections["A"].stimulus
    assert "opéra" in combo.sections["B"].stimulus
    assert combo.id == "a-1+b-1"


def test_build_tef_oral_from_pool_empty_raises():
    with pytest.raises(HTTPException) as exc:
        _build_tef_oral_from_pool(
            [
                {
                    "id": "a-only",
                    "combination_index": 1,
                    "title": "Section A only",
                    "tasks": [{"section_id": "A", "prompt": "A", "stimulus": "S"}],
                }
            ]
        )
    assert exc.value.status_code == 404


def test_get_oral_combination_tcf_uses_pool(client, auth_headers, mock_db):
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[
            _task2_row("t2-1", "Role-play one"),
            _task3_row("t3-1", "Sujet : Opinion one"),
        ]
    )
    response = client.get(
        "/api/v1/oral-combination?exam_type=TCF&module_id=expression-orale",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["sections"]["2"]["stimulus"] == "Role-play one"
    assert body["sections"]["3"]["stimulus"] == "Sujet : Opinion one"
    assert body["sections"]["1"]["stimulus"].startswith("Présentez-vous")
