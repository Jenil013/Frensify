from fastapi import APIRouter, Depends, status
from typing import List, Optional, Any
from pydantic import BaseModel
from database import get_db
from dependencies import get_profile

router = APIRouter(tags=["exams"])


class ExamScoreIn(BaseModel):
    exam_name: str
    score_pct: int
    cefr: str
    module_breakdown: Optional[List[Any]] = None


@router.get("/exams/scores")
async def get_scores(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table("mock_test_scores")
        .select("*")
        .eq("user_id", profile["id"])
        .order("taken_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/exams/scores", status_code=status.HTTP_201_CREATED)
async def post_score(
    body: ExamScoreIn,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table("mock_test_scores")
        .insert(
            {
                "user_id": profile["id"],
                "exam_name": body.exam_name,
                "score_pct": body.score_pct,
                "cefr": body.cefr,
                "module_breakdown": body.module_breakdown,
            }
        )
        .execute()
    )
    return result.data[0]
