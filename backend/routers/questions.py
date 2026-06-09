import random
from typing import List, Optional

from fastapi import APIRouter, Depends, Query

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
LISTENING_IMAGE_FRONT_COUNT = 3


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


def _sample_listening_rows(rows: list[dict], count: int) -> list[dict]:
    image_rows = [r for r in rows if _row_has_image(r)]
    other_rows = [r for r in rows if not _row_has_image(r)]

    front_count = min(LISTENING_IMAGE_FRONT_COUNT, len(image_rows), count)
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


@router.get("/questions", response_model=List[QuestionItem])
async def list_questions(
    exam_type: str = Query(...),
    module_id: str = Query(...),
    limit: Optional[int] = Query(None, ge=1),
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table("questions")
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
        sampled = _sample_listening_rows(rows, count)
    else:
        sampled = random.sample(rows, count)

    return [_map_row(row) for row in sampled]
