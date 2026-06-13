from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field
from database import get_db
from dependencies import get_profile

router = APIRouter(tags=["exams"])


class ExamScoreIn(BaseModel):
    exam_name: str
    score_pct: int = Field(ge=0, le=100)
    cefr: str
    module_breakdown: Optional[List[Any]] = None


class ModuleScoreIn(BaseModel):
    exam_type: Literal["TEF", "TCF"]
    module_id: str
    raw_score: int = Field(ge=0)
    max_score: int = Field(gt=0)
    exam_context: Literal["practice", "mock"] = "practice"


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


@router.post("/exams/module-scores", status_code=status.HTTP_201_CREATED)
async def post_module_score(
    body: ModuleScoreIn,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    if body.raw_score > body.max_score:
        raise HTTPException(
            status_code=400,
            detail="raw_score cannot exceed max_score",
        )

    result = (
        db.table("module_scores")
        .insert(
            {
                "user_id": profile["id"],
                "exam_type": body.exam_type,
                "module_id": body.module_id,
                "raw_score": body.raw_score,
                "max_score": body.max_score,
                "exam_context": body.exam_context,
            }
        )
        .execute()
    )
    return result.data[0]
