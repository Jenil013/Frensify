from fastapi import APIRouter, Depends
from typing import Optional
from pydantic import BaseModel
from database import get_db
from dependencies import get_profile

router = APIRouter(tags=["vocabulary"])


class VocabCardIn(BaseModel):
    word: str
    translation: str
    category: Optional[str] = None
    difficulty: Optional[str] = None


class VocabCardUpdate(BaseModel):
    mastered: Optional[bool] = None
    category: Optional[str] = None


@router.get("/vocabulary")
async def list_vocab(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table("vocabulary_cards")
        .select("*")
        .or_(f"user_id.is.null,user_id.eq.{profile['id']}")
        .execute()
    )
    return result.data


@router.post("/vocabulary", status_code=201)
async def add_vocab_card(
    card: VocabCardIn,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    result = (
        db.table("vocabulary_cards")
        .insert({**card.model_dump(), "user_id": profile["id"]})
        .execute()
    )
    return result.data[0]


@router.patch("/vocabulary/{card_id}")
async def update_vocab_card(
    card_id: str,
    update: VocabCardUpdate,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    patch_data = update.model_dump(exclude_none=True)
    result = (
        db.table("vocabulary_cards")
        .update(patch_data)
        .eq("id", card_id)
        .eq("user_id", profile["id"])
        .execute()
    )
    return result.data[0]
