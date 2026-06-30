import random
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from config import (
    CAPPED_FREE_MODULE_IDS,
    DEFAULT_QUESTION_LIMIT,
    FREE_SET_LABELS,
    FREE_SET_NUMBERS,
)
from database import get_db
from dependencies import get_profile
from models.questions import QuestionItem
from services.free_sets import count_set_questions, fetch_free_set_questions
from services.question_rows import LISTENING_MODULE_ID, MODULE_TABLE, READING_MODULE_ID, map_row
from services.question_sampling import sample_module_rows

router = APIRouter(tags=["questions"])

# Re-export for tests and generator script compatibility.
from services.question_sampling import (  # noqa: E402
    LISTENING_IMAGE_FRONT_COUNT,
    TCF_READING_DIFFICULTY_BANDS,
    TEF_READING_DIFFICULTY_BANDS,
)


def _question_table(module_id: str) -> str:
    table = MODULE_TABLE.get(module_id)
    if table is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported module_id for MCQ questions: {module_id}",
        )
    return table


class PracticeSetOut(BaseModel):
    set: int
    label: str
    questionCount: int


@router.get("/practice-sets", response_model=List[PracticeSetOut])
async def list_practice_sets(
    exam_type: str = Query(...),
    module_id: str = Query(...),
    profile: dict = Depends(get_profile),
):
    if profile["tier"] != "Free":
        return []
    if module_id not in CAPPED_FREE_MODULE_IDS:
        raise HTTPException(
            status_code=400,
            detail=f"Practice sets are only available for comprehension modules",
        )

    return [
        PracticeSetOut(
            set=set_number,
            label=FREE_SET_LABELS[set_number],
            questionCount=count_set_questions(exam_type, module_id, set_number),
        )
        for set_number in FREE_SET_NUMBERS
    ]


@router.get("/questions", response_model=List[QuestionItem])
async def list_questions(
    exam_type: str = Query(...),
    module_id: str = Query(...),
    limit: Optional[int] = Query(None, ge=1),
    set: Optional[int] = Query(None, ge=1, le=2),
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    tier = profile["tier"]
    is_free_comprehension = (
        tier == "Free" and module_id in CAPPED_FREE_MODULE_IDS
    )

    if is_free_comprehension:
        if set is None:
            raise HTTPException(
                status_code=403,
                detail="Free tier requires a practice set (set=1 or set=2)",
            )
        if set not in FREE_SET_NUMBERS:
            raise HTTPException(status_code=403, detail="Invalid practice set number")
        return fetch_free_set_questions(db, exam_type, module_id, set)

    if set is not None and tier == "Free":
        raise HTTPException(status_code=403, detail="Invalid practice set for this module")

    result = (
        db.table(_question_table(module_id))
        .select("*")
        .eq("exam_type", exam_type)
        .eq("module_id", module_id)
        .execute()
    )
    rows = result.data or []

    desired = limit if limit is not None else DEFAULT_QUESTION_LIMIT
    count = min(desired, len(rows))
    if count <= 0:
        return []

    sampled = sample_module_rows(rows, count, exam_type, module_id)
    return [map_row(row) for row in sampled]
