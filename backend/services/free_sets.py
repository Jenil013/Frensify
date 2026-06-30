"""Load frozen Free-tier practice tests from backend/free_sets/*.txt files."""

from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException

from config import FREE_SET_DIR, FREE_SET_FILES, FREE_SET_NUMBERS
from models.questions import QuestionItem
from services.question_rows import MODULE_TABLE, map_row


def free_set_filename(exam_type: str, module_id: str, set_number: int) -> str:
    key = (exam_type, module_id, set_number)
    filename = FREE_SET_FILES.get(key)
    if filename is None:
        raise HTTPException(
            status_code=400,
            detail=f"No free practice set for {exam_type}/{module_id} set {set_number}",
        )
    return filename


def free_set_path(exam_type: str, module_id: str, set_number: int) -> Path:
    return FREE_SET_DIR / free_set_filename(exam_type, module_id, set_number)


def load_set_ids(exam_type: str, module_id: str, set_number: int) -> list[str]:
    if set_number not in FREE_SET_NUMBERS:
        raise HTTPException(status_code=403, detail="Invalid practice set number")

    path = free_set_path(exam_type, module_id, set_number)
    if not path.is_file():
        raise HTTPException(
            status_code=500,
            detail=f"Free practice set file missing: {path.name}",
        )

    ids: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        value = line.strip()
        if value:
            ids.append(value)
    if not ids:
        raise HTTPException(
            status_code=500,
            detail=f"Free practice set file is empty: {path.name}",
        )
    return ids


def count_set_questions(exam_type: str, module_id: str, set_number: int) -> int:
    return len(load_set_ids(exam_type, module_id, set_number))


def fetch_free_set_questions(
    db,
    exam_type: str,
    module_id: str,
    set_number: int,
) -> list[QuestionItem]:
    ids = load_set_ids(exam_type, module_id, set_number)
    table = MODULE_TABLE.get(module_id)
    if table is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported module_id for MCQ questions: {module_id}",
        )

    result = db.table(table).select("*").in_("id", ids).execute()
    rows = result.data or []
    by_id = {str(row["id"]): row for row in rows}

    missing = [qid for qid in ids if qid not in by_id]
    if missing:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Free set {set_number} references {len(missing)} missing question(s). "
                "Regenerate backend/free_sets files."
            ),
        )

    return [map_row(by_id[qid]) for qid in ids]
