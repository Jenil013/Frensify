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
from models.oral_combination import (
    OralCombinationResponse,
    OralCombinationSection,
)
from content.tcf_oral_task1 import build_tcf_task1_section

_EXPECTED_ORAL_SECTIONS = {
    "TCF": 3,
    "TEF": 2,
}

_EXPECTED_WRITING_SECTIONS = {
    "TCF": 3,
    "TEF": 2,
}

from services.streak_service import record_practice_day

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
    record_practice_day(db, profile)
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
    exam_key = str(row.get("exam_type", "TCF")).upper()
    expected = _EXPECTED_WRITING_SECTIONS.get(exam_key, 3)
    if len(sections) < expected:
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


def _task_section_from_row(row: dict) -> str | None:
    tasks = row.get("tasks") or []
    if len(tasks) != 1:
        return None
    return str(tasks[0].get("section_id", "")) or None


def _section_from_task(task: dict) -> OralCombinationSection:
    return OralCombinationSection(
        prompt=task["prompt"],
        stimulus=task.get("stimulus"),
    )


def _build_tef_oral_from_pool(rows: list[dict]) -> OralCombinationResponse:
    section_a_rows = [r for r in rows if _task_section_from_row(r) == "A"]
    section_b_rows = [r for r in rows if _task_section_from_row(r) == "B"]
    if not section_a_rows or not section_b_rows:
        raise HTTPException(
            status_code=404,
            detail="TEF oral task pools are empty. Run import_tef_speaking_questions.py.",
        )

    section_a_row = random.choice(section_a_rows)
    section_b_row = random.choice(section_b_rows)
    section_a = _section_from_task(section_a_row["tasks"][0])
    section_b = _section_from_task(section_b_row["tasks"][0])

    return OralCombinationResponse(
        id=f"{section_a_row['id']}+{section_b_row['id']}",
        combinationIndex=section_a_row.get("combination_index") or 0,
        title=(
            f"TEF Expression orale - {section_a_row.get('title', 'Section A')} + "
            f"{section_b_row.get('title', 'Section B')}"
        ),
        sections={
            "A": section_a,
            "B": section_b,
        },
    )


def _build_tcf_oral_from_pool(rows: list[dict]) -> OralCombinationResponse:
    task2_rows = [r for r in rows if _task_section_from_row(r) == "2"]
    task3_rows = [r for r in rows if _task_section_from_row(r) == "3"]
    if not task2_rows or not task3_rows:
        raise HTTPException(
            status_code=404,
            detail="TCF oral task pools are empty. Run import_tcf_speaking_questions.py.",
        )

    task2_row = random.choice(task2_rows)
    task3_row = random.choice(task3_rows)
    task1, task1_topic_id = build_tcf_task1_section()
    task2 = _section_from_task(task2_row["tasks"][0])
    task3 = _section_from_task(task3_row["tasks"][0])

    return OralCombinationResponse(
        id=f"task1-{task1_topic_id}+{task2_row['id']}+{task3_row['id']}",
        combinationIndex=task2_row.get("combination_index") or 0,
        title=(
            f"TCF Expression orale - Tâche 1 ({task1_topic_id}) + "
            f"{task2_row.get('title', 'Tâche 2')} + {task3_row.get('title', 'Tâche 3')}"
        ),
        sections={
            "1": task1,
            "2": task2,
            "3": task3,
        },
    )


def _map_oral_combination(row: dict, exam_type: str) -> OralCombinationResponse:
    tasks = row.get("tasks") or []
    sections: dict[str, OralCombinationSection] = {}
    for task in tasks:
        section_id = str(task.get("section_id", ""))
        if not section_id:
            continue
        sections[section_id] = OralCombinationSection(
            prompt=task["prompt"],
            stimulus=task.get("stimulus"),
        )
    expected = _EXPECTED_ORAL_SECTIONS.get(exam_type.upper())
    if expected is None or len(sections) < expected:
        raise HTTPException(status_code=500, detail="Invalid oral combination in database.")

    return OralCombinationResponse(
        id=str(row["id"]),
        combinationIndex=row.get("combination_index") or 0,
        title=row["title"],
        sections=sections,
    )


@router.get("/oral-combination", response_model=OralCombinationResponse)
async def get_oral_combination(
    exam_type: str = Query(...),
    module_id: str = Query(...),
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table("exercise_items")
        .select("*")
        .eq("exam_type", exam_type)
        .eq("skill", "speaking")
        .eq("module_id", module_id)
        .execute()
    )
    rows = [r for r in (result.data or []) if r.get("tasks")]
    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No oral combinations found for this exam and module.",
        )

    exam_key = exam_type.upper()
    if exam_key == "TCF":
        pool_rows = [r for r in rows if _task_section_from_row(r) in {"2", "3"}]
        full_rows = [
            r for r in rows
            if len(r.get("tasks") or []) >= _EXPECTED_ORAL_SECTIONS["TCF"]
        ]
        if pool_rows:
            return _build_tcf_oral_from_pool(pool_rows)
        if full_rows:
            return _map_oral_combination(random.choice(full_rows), exam_type)
        raise HTTPException(
            status_code=404,
            detail="No TCF oral task pools or full combinations found.",
        )

    pool_rows = [r for r in rows if _task_section_from_row(r) in {"A", "B"}]
    full_rows = [
        r for r in rows
        if len(r.get("tasks") or []) >= _EXPECTED_ORAL_SECTIONS.get(exam_key, 2)
    ]
    if pool_rows:
        return _build_tef_oral_from_pool(pool_rows)
    if full_rows:
        return _map_oral_combination(random.choice(full_rows), exam_type)
    raise HTTPException(
        status_code=404,
        detail="No oral combinations found for this exam and module.",
    )
