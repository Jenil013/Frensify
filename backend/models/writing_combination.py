from typing import Dict, Optional

from pydantic import BaseModel


class WritingCombinationSection(BaseModel):
    prompt: str
    stimulus: Optional[str] = None


class WritingCombinationResponse(BaseModel):
    id: str
    combinationIndex: int
    title: str
    sections: Dict[str, WritingCombinationSection]
