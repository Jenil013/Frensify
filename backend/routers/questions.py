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


def _map_row(row: dict) -> QuestionItem:
    return QuestionItem(
        id=str(row["id"]),
        prompt=row["prompt"],
        passage=row.get("passage"),
        audioUrl=row.get("audio_path"),
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

    sampled = random.sample(rows, count)
    return [_map_row(row) for row in sampled]
