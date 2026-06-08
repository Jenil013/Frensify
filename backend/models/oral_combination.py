from typing import Dict, Optional

from pydantic import BaseModel


class OralCombinationSection(BaseModel):
    prompt: str
    stimulus: Optional[str] = None


class OralCombinationResponse(BaseModel):
    id: str
    combinationIndex: int
    title: str
    sections: Dict[str, OralCombinationSection]
