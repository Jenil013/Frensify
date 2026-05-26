from pydantic import BaseModel
from typing import Optional


class ExerciseItem(BaseModel):
    id: str
    exam_type: str
    skill: str
    title: str
    prompt: str
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    question_type: str
    tier_required: str


class CompleteExerciseRequest(BaseModel):
    exercise_id: str
