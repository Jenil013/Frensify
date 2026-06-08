import sys
from pathlib import Path
from unittest.mock import MagicMock

_SEED_DIR = Path(__file__).resolve().parents[2] / "supabase" / "seed"
sys.path.insert(0, str(_SEED_DIR))
from import_tcf_writing import discover_sources, parse_tcf_writing_file  # noqa: E402

_COMBO_ROW = {
    "id": "combo-uuid-1",
    "exam_type": "TCF",
    "skill": "writing",
    "module_id": "expression-ecrite",
    "combination_index": 3,
    "title": "Combinaison 3 — Expression écrite (May2026)",
    "tasks": [
        {"section_id": "1", "prompt": "Task one prompt."},
        {"section_id": "2", "prompt": "Task two prompt."},
        {
            "section_id": "3",
            "prompt": "Theme line.\n\nÀ partir des deux documents ci-dessous...",
            "stimulus": "Document 1 :\n\nText A.\n\nDocument 2 :\n\nText B.",
        },
    ],
}


def test_get_writing_combination_returns_three_sections(client, auth_headers, mock_db):
    (
        mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.eq
        .return_value.execute.return_value
    ) = MagicMock(data=[_COMBO_ROW])

    response = client.get(
        "/api/v1/writing-combination?exam_type=TCF&module_id=expression-ecrite",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "combo-uuid-1"
    assert body["combinationIndex"] == 3
    assert set(body["sections"].keys()) == {"1", "2", "3"}
    assert body["sections"]["3"]["stimulus"].startswith("Document 1")


def test_get_writing_combination_404_when_empty(client, auth_headers, mock_db):
    (
        mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.eq
        .return_value.execute.return_value
    ) = MagicMock(data=[])

    response = client.get(
        "/api/v1/writing-combination?exam_type=TCF&module_id=expression-ecrite",
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_discover_sources_aug2025_through_may2026():
    sources = discover_sources()
    names = [p.name for p in sources]
    assert names[0].startswith("Aug2025")
    assert names[-1].startswith("May2026")
    assert len(sources) == 10


def test_global_combination_indexes_across_all_files():
    sources = discover_sources()
    next_index = 1
    for source in sources:
        rows = parse_tcf_writing_file(source)
        for row in rows:
            indexed = {
                "combination_index": next_index,
                **{k: v for k, v in row.items() if k != "source_combo"},
            }
            assert indexed["combination_index"] == next_index
            next_index += 1
    assert next_index - 1 == 105


def test_parse_may2026_writing_file():
    source = (
        Path(__file__).resolve().parents[2]
        / "supabase"
        / "question_bank"
        / "TCF Writing"
        / "May2026_Expression_Ecrite_Topics.txt"
    )
    rows = parse_tcf_writing_file(source)
    assert len(rows) == 11
    assert rows[0]["source_combo"] == 1
    assert len(rows[0]["tasks"]) == 3
    stimulus = rows[0]["tasks"][2].get("stimulus", "")
    assert stimulus.startswith("Document 1 :\n\n")
    assert "\n\nDocument 2 :\n\n" in stimulus
