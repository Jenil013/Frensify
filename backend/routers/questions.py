import random
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from config import (
    CAPPED_FREE_MODULE_IDS,
    DEFAULT_QUESTION_LIMIT,
    FREE_READING_LISTENING_CAP,
)
from database import get_db
from dependencies import get_profile
from models.questions import QuestionItem

router = APIRouter(tags=["questions"])

LISTENING_MODULE_ID = "comprehension-orale"
READING_MODULE_ID = "comprehension-ecrite"

_MODULE_TABLE: dict[str, str] = {
    LISTENING_MODULE_ID: "listening_questions",
    READING_MODULE_ID: "reading_questions",
}
LISTENING_IMAGE_FRONT_COUNT: dict[str, int] = {
    "TCF": 3,
    "TEF": 4,
}

# Official TEF Canada reading bands (40 questions total).
TEF_READING_DIFFICULTY_BANDS: list[tuple[str, int]] = [
    ("A1", 13),
    ("A2", 7),
    ("B1", 6),
    ("B2", 4),
    ("C1", 4),
    ("C2", 6),
]


def _question_table(module_id: str) -> str:
    table = _MODULE_TABLE.get(module_id)
    if table is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported module_id for MCQ questions: {module_id}",
        )
    return table


def _map_row(row: dict) -> QuestionItem:
    return QuestionItem(
        id=str(row["id"]),
        prompt=row["prompt"],
        passage=row.get("passage"),
        audioUrl=row.get("audio_path"),
        imageUrl=row.get("image_path"),
        choices=row.get("choices") or [],
        correctChoiceIndex=row.get("correct_index") or 0,
        explanation=row.get("explanation"),
        difficulty=row.get("difficulty"),
    )


def _effective_count(requested: int, available: int, tier: str, module_id: str) -> int:
    count = min(requested, available)
    if tier == "Free" and module_id in CAPPED_FREE_MODULE_IDS:
        count = min(count, FREE_READING_LISTENING_CAP)
    return count


def _row_has_image(row: dict) -> bool:
    path = row.get("image_path")
    return bool(path and str(path).strip())


def _sample_listening_rows(rows: list[dict], count: int, exam_type: str) -> list[dict]:
    image_rows = [r for r in rows if _row_has_image(r)]
    other_rows = [r for r in rows if not _row_has_image(r)]

    front_cap = LISTENING_IMAGE_FRONT_COUNT.get(exam_type, 3)
    front_count = min(front_cap, len(image_rows), count)
    front = random.sample(image_rows, front_count) if front_count else []

    remaining = count - len(front)
    rest_pool = [r for r in other_rows if r not in front]
    rest_count = min(remaining, len(rest_pool))
    rest = random.sample(rest_pool, rest_count) if rest_count else []

    combined = front + rest
    if len(combined) < count:
        used_ids = {r["id"] for r in combined}
        filler = [r for r in rows if r["id"] not in used_ids]
        need = count - len(combined)
        combined.extend(random.sample(filler, min(need, len(filler))))

    return combined[:count]


def _sample_tef_reading_rows(rows: list[dict], count: int) -> list[dict]:
    by_difficulty: dict[str, list[dict]] = {}
    for row in rows:
        difficulty = row.get("difficulty")
        if difficulty:
            by_difficulty.setdefault(difficulty, []).append(row)

    result: list[dict] = []
    remaining = count
    for difficulty, band_size in TEF_READING_DIFFICULTY_BANDS:
        if remaining <= 0:
            break
        take = min(band_size, remaining)
        pool = by_difficulty.get(difficulty, [])
        if not pool:
            continue
        result.extend(random.sample(pool, min(take, len(pool))))
        remaining -= min(take, len(pool))

    return result[:count]


@router.get("/questions", response_model=List[QuestionItem])
async def list_questions(
    exam_type: str = Query(...),
    module_id: str = Query(...),
    limit: Optional[int] = Query(None, ge=1),
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table(_question_table(module_id))
        .select("*")
        .eq("exam_type", exam_type)
        .eq("module_id", module_id)
        .execute()
    )
    rows = result.data or []

    desired = limit if limit is not None else DEFAULT_QUESTION_LIMIT
    count = _effective_count(desired, len(rows), profile["tier"], module_id)
    if count <= 0:
        return []

    if module_id == LISTENING_MODULE_ID:
        sampled = _sample_listening_rows(rows, count, exam_type)
    elif module_id == READING_MODULE_ID and exam_type == "TEF":
        sampled = _sample_tef_reading_rows(rows, count)
    else:
        sampled = random.sample(rows, count)

    return [_map_row(row) for row in sampled]
