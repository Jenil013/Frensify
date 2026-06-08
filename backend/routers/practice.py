import random
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from database import get_db
from dependencies import get_profile
from models.practice import ExerciseItem
from models.writing_combination import (
    WritingCombinationResponse,
    WritingCombinationSection,
)

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


def _map_writing_combination(row: dict) -> WritingCombinationResponse:
    tasks = row.get("tasks") or []
    sections: dict[str, WritingCombinationSection] = {}
    for task in tasks:
        section_id = str(task.get("section_id", ""))
        if not section_id:
            continue
        sections[section_id] = WritingCombinationSection(
            prompt=task["prompt"],
            stimulus=task.get("stimulus"),
        )
    if len(sections) < 3:
        raise HTTPException(status_code=500, detail="Invalid writing combination in database.")

    return WritingCombinationResponse(
        id=str(row["id"]),
        combinationIndex=row.get("combination_index") or 0,
        title=row["title"],
        sections=sections,
    )


@router.get("/writing-combination", response_model=WritingCombinationResponse)
async def get_writing_combination(
    exam_type: str = Query(...),
    module_id: str = Query(...),
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table("exercise_items")
        .select("*")
        .eq("exam_type", exam_type)
        .eq("skill", "writing")
        .eq("module_id", module_id)
        .execute()
    )
    rows = [r for r in (result.data or []) if r.get("tasks")]
    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No writing combinations found for this exam and module.",
        )
    return _map_writing_combination(random.choice(rows))
