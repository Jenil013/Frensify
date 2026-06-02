from pydantic import BaseModel
from typing import List, Optional


class QuestionItem(BaseModel):
    id: str
    prompt: str
    passage: Optional[str] = None
    audioUrl: Optional[str] = None
    choices: List[str]
    correctChoiceIndex: int
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
