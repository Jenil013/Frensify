from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from pydantic import BaseModel, Field

from database import get_db
from dependencies import get_profile
from services.vocabulary_service import (
    apply_review_result,
    compute_review_stats,
    compute_vocab_suggestions,
    merge_card_with_progress,
    select_review_cards,
)

router = APIRouter(tags=["vocabulary"])


class VocabCardIn(BaseModel):
    word: str
    translation: str
    category: Optional[str] = None
    difficulty: Optional[str] = "B2"
    example_sentence: Optional[str] = None
    exam_type: Optional[str] = "both"


class VocabCardUpdate(BaseModel):
    mastered: Optional[bool] = None
    category: Optional[str] = None
    review_result: Optional[str] = Field(None, pattern="^(again|got_it)$")


def _fetch_cards_and_progress(db, user_id: str) -> tuple[list[dict], dict[str, dict]]:
    cards_result = (
        db.table("vocabulary_cards")
        .select("*")
        .or_(f"user_id.is.null,user_id.eq.{user_id}")
        .execute()
    )
    cards = cards_result.data or []

    progress_result = (
        db.table("user_vocabulary_progress")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    progress_by_card = {row["card_id"]: row for row in (progress_result.data or [])}
    return cards, progress_by_card


def _merged_list(db, user_id: str) -> list[dict]:
    cards, progress_by_card = _fetch_cards_and_progress(db, user_id)
    return [
        merge_card_with_progress(card, progress_by_card.get(card["id"]))
        for card in cards
    ]


@router.get("/vocabulary")
async def list_vocab(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    return _merged_list(db, profile["id"])


@router.get("/vocabulary/stats")
async def vocabulary_stats(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    progress_result = (
        db.table("user_vocabulary_progress")
        .select("last_reviewed_at")
        .eq("user_id", profile["id"])
        .execute()
    )
    return compute_review_stats(progress_result.data or [])


@router.get("/vocabulary/review")
async def vocabulary_review(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
    limit: int = Query(5, ge=1, le=20),
    exam_type: Optional[str] = Query(None),
    categories: Optional[str] = Query(None, description="Comma-separated category names"),
):
    merged = _merged_list(db, profile["id"])
    category_list = [c.strip() for c in categories.split(",") if c.strip()] if categories else None
    exam = exam_type or profile.get("target_exam") or "TEF"
    target = profile.get("target_score") or "B2"
    return select_review_cards(
        merged,
        exam_type=exam,
        target_score=target,
        categories=category_list,
        limit=limit,
    )


@router.get("/vocabulary/suggestions")
async def vocabulary_suggestions(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    user_id = profile["id"]
    writing = (
        db.table("writing_submissions")
        .select("ai_feedback")
        .eq("user_id", user_id)
        .order("submitted_at", desc=True)
        .limit(10)
        .execute()
    )
    speaking = (
        db.table("speaking_sessions")
        .select("ai_feedback")
        .eq("user_id", user_id)
        .order("submitted_at", desc=True)
        .limit(10)
        .execute()
    )
    suggestion = compute_vocab_suggestions(
        target_score=profile.get("target_score") or "B2",
        writing_submissions=writing.data or [],
        speaking_sessions=speaking.data or [],
    )
    if suggestion is None:
        return {"hasSuggestion": False}
    return {"hasSuggestion": True, **suggestion}


@router.post("/vocabulary", status_code=201)
async def add_vocab_card(
    card: VocabCardIn,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    payload = {**card.model_dump(), "user_id": profile["id"]}
    result = db.table("vocabulary_cards").insert(payload).execute()
    created = result.data[0]
    return merge_card_with_progress(created, None)


@router.patch("/vocabulary/{card_id}")
async def update_vocab_card(
    card_id: str,
    update: VocabCardUpdate,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    user_id = profile["id"]
    card_result = (
        db.table("vocabulary_cards")
        .select("id,user_id")
        .eq("id", card_id)
        .execute()
    )
    if not card_result.data:
        raise HTTPException(status_code=404, detail="Vocabulary card not found.")

    card = card_result.data[0]
    if card.get("user_id") not in (None, user_id):
        raise HTTPException(status_code=403, detail="Not allowed to update this card.")

    if card.get("user_id") == user_id and update.category is not None:
        db.table("vocabulary_cards").update({"category": update.category}).eq(
            "id", card_id
        ).eq("user_id", user_id).execute()

    progress_result = (
        db.table("user_vocabulary_progress")
        .select("*")
        .eq("user_id", user_id)
        .eq("card_id", card_id)
        .execute()
    )
    existing = progress_result.data[0] if progress_result.data else None

    if update.review_result:
        patch = apply_review_result(existing, update.review_result)
    else:
        patch = dict(existing or {})
        if update.mastered is not None:
            patch["mastered"] = update.mastered

    patch["user_id"] = user_id
    patch["card_id"] = card_id

    if existing:
        db.table("user_vocabulary_progress").update(patch).eq(
            "user_id", user_id
        ).eq("card_id", card_id).execute()
    else:
        db.table("user_vocabulary_progress").insert(patch).execute()

    merged_cards = _merged_list(db, user_id)
    updated = next((c for c in merged_cards if c["id"] == card_id), None)
    if not updated:
        raise HTTPException(status_code=404, detail="Vocabulary card not found.")
    return updated
