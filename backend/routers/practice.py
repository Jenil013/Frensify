from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from database import get_db
from dependencies import get_profile
from models.practice import ExerciseItem

router = APIRouter(tags=["practice"])


@router.get("/exercises", response_model=List[ExerciseItem])
async def list_exercises(
    exam_type: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    query = db.table("exercise_items").select("*")
    if exam_type:
        query = query.eq("exam_type", exam_type)
    if skill:
        query = query.eq("skill", skill)
    result = query.execute()
    return result.data


@router.post("/exercises/{exercise_id}/complete")
async def complete_exercise(
    exercise_id: str,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    db.table("completed_exercises").insert(
        {"user_id": profile["id"], "exercise_id": exercise_id}
    ).execute()
    return {"message": "Exercise marked complete."}
