import uuid
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from dependencies import require_ai_cap, get_profile
from models.ai import (
    WritingEvalRequest, AIWritingCorrection,
    WritingModuleEvalRequest, WritingModuleEvalResponse,
    WritingSectionFeedback,
    SpeakingEvalRequest, AISpeakingSuggestion,
    SpeakingModuleEvalRequest, SpeakingModuleEvalResponse,
    SpeakingSectionFeedback,
    StudyPlanRequest, StudyPlanResponse,
    VocabExplainRequest, VocabExplainResponse,
    SpeakingUploadUrlResponse,
)
from services.gemini_service import (
    evaluate_writing, evaluate_speaking,
    generate_study_plan, explain_vocab,
)
from services.usage_service import increment, write_audit_log
from config import settings

router = APIRouter(prefix="/ai", tags=["ai"])


def _monday() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


# ─── Writing ────────────────────────────────────────────────────────────────

@router.post("/writing", response_model=AIWritingCorrection)
async def writing_practice(
    body: WritingEvalRequest,
    profile: dict = Depends(require_ai_cap("writing_eval", "practice")),
    db=Depends(get_db),
):
    feedback = evaluate_writing(
        body.essay_text,
        body.prompt,
        body.exam_type,
        task_number=body.task_number or f"{body.exam_type} practice ({body.exercise_id})",
        min_words=body.min_words if body.min_words is not None else 0,
    )
    db.table("writing_submissions").insert({
        "user_id": profile["id"],
        "exercise_id": body.exercise_id,
        "essay_text": body.essay_text,
        "word_count": body.word_count,
        "exam_type": body.exam_type,
        "ai_feedback": feedback.model_dump(),
        "cefr_score": feedback.cefrScore,
        "score_range": feedback.scoreRange,
    }).execute()
    increment(db, profile["id"], _monday(), "writing_eval")
    write_audit_log(db, profile["id"], "writing_eval", "practice")
    return feedback


@router.post("/writing/mock", response_model=AIWritingCorrection)
async def writing_mock(
    body: WritingEvalRequest,
    profile: dict = Depends(require_ai_cap("writing_eval", "mock")),
    db=Depends(get_db),
):
    feedback = evaluate_writing(
        body.essay_text,
        body.prompt,
        body.exam_type,
        task_number=body.task_number or f"{body.exam_type} mock ({body.exercise_id})",
        min_words=body.min_words if body.min_words is not None else 0,
    )
    db.table("writing_submissions").insert({
        "user_id": profile["id"],
        "exercise_id": body.exercise_id,
        "essay_text": body.essay_text,
        "word_count": body.word_count,
        "exam_type": body.exam_type,
        "ai_feedback": feedback.model_dump(),
        "cefr_score": feedback.cefrScore,
        "score_range": feedback.scoreRange,
    }).execute()
    write_audit_log(db, profile["id"], "writing_eval", "mock")
    return feedback


_EXPECTED_MODULE_SECTIONS = {
    "TCF": 3,
    "TEF": 2,
}


def _validate_module_sections(body: WritingModuleEvalRequest) -> None:
    expected = _EXPECTED_MODULE_SECTIONS.get(body.exam_type.upper())
    if expected is None:
        raise HTTPException(status_code=422, detail=f"Unsupported exam_type: {body.exam_type}")
    if len(body.sections) != expected:
        raise HTTPException(
            status_code=422,
            detail=f"{body.exam_type} writing module requires {expected} sections, got {len(body.sections)}.",
        )


def _run_writing_module_eval(
    body: WritingModuleEvalRequest,
    profile: dict,
    db,
    context: str,
) -> WritingModuleEvalResponse:
    _validate_module_sections(body)
    section_results: list[WritingSectionFeedback] = []
    for section in body.sections:
        feedback = evaluate_writing(
            section.essay_text,
            section.prompt,
            body.exam_type,
            task_number=section.task_number or f"{body.exam_type} Task {section.section_id}",
            min_words=section.min_words if section.min_words is not None else 0,
        )
        exercise_id = f"{body.exam_type}-{body.module_id}-{section.section_id}"
        db.table("writing_submissions").insert({
            "user_id": profile["id"],
            "exercise_id": exercise_id,
            "essay_text": section.essay_text,
            "word_count": section.word_count,
            "exam_type": body.exam_type,
            "ai_feedback": feedback.model_dump(),
            "cefr_score": feedback.cefrScore,
            "score_range": feedback.scoreRange,
        }).execute()
        section_results.append(
            WritingSectionFeedback(section_id=section.section_id, feedback=feedback)
        )
    if context == "practice":
        increment(db, profile["id"], _monday(), "writing_eval")
    write_audit_log(db, profile["id"], "writing_eval", context)
    return WritingModuleEvalResponse(sections=section_results)


@router.post("/writing/module", response_model=WritingModuleEvalResponse)
async def writing_module_practice(
    body: WritingModuleEvalRequest,
    profile: dict = Depends(require_ai_cap("writing_eval", "practice")),
    db=Depends(get_db),
):
    return _run_writing_module_eval(body, profile, db, "practice")


@router.post("/writing/module/mock", response_model=WritingModuleEvalResponse)
async def writing_module_mock(
    body: WritingModuleEvalRequest,
    profile: dict = Depends(require_ai_cap("writing_eval", "mock")),
    db=Depends(get_db),
):
    return _run_writing_module_eval(body, profile, db, "mock")


# ─── Speaking helpers ────────────────────────────────────────────────────────

def _download_audio(storage_path: str) -> tuple[bytes, str]:
    """Download audio from speaking-recordings bucket. Returns (bytes, mime_type)."""
    from supabase import create_client
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    data = client.storage.from_("speaking-recordings").download(storage_path)
    ext = storage_path.rsplit(".", 1)[-1].lower() if "." in storage_path else "webm"
    mime_map = {"webm": "audio/webm", "mp3": "audio/mpeg", "wav": "audio/wav", "m4a": "audio/mp4"}
    return data, mime_map.get(ext, "audio/webm")


def _delete_audio(storage_path: str) -> None:
    """Delete audio from speaking-recordings bucket using service role key."""
    from supabase import create_client
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    client.storage.from_("speaking-recordings").remove([storage_path])


def _run_speaking_eval(body: SpeakingEvalRequest) -> AISpeakingSuggestion:
    """Download audio, evaluate with Gemini, delete audio after success."""
    audio_bytes, mime_type = _download_audio(body.storage_path)
    feedback = evaluate_speaking(
        audio_bytes=audio_bytes,
        audio_mime_type=mime_type,
        prompt=body.prompt,
        exam_type=body.exam_type,
        duration_seconds=body.duration_seconds,
    )
    # Delete only after successful evaluation so client can retry on Gemini failure
    _delete_audio(body.storage_path)
    return feedback


# ─── Speaking ────────────────────────────────────────────────────────────────

def _validate_speaking_module_sections(body: SpeakingModuleEvalRequest) -> None:
    expected = _EXPECTED_MODULE_SECTIONS.get(body.exam_type.upper())
    if expected is None:
        raise HTTPException(status_code=422, detail=f"Unsupported exam_type: {body.exam_type}")
    if len(body.sections) != expected:
        raise HTTPException(
            status_code=422,
            detail=f"{body.exam_type} speaking module requires {expected} sections, got {len(body.sections)}.",
        )


def _run_speaking_module_eval(
    body: SpeakingModuleEvalRequest,
    profile: dict,
    db,
    context: str,
) -> SpeakingModuleEvalResponse:
    _validate_speaking_module_sections(body)
    section_results: list[SpeakingSectionFeedback] = []
    for section in body.sections:
        eval_body = SpeakingEvalRequest(
            exercise_id=f"{body.exercise_id}-{section.section_id}",
            storage_path=section.storage_path,
            duration_seconds=section.duration_seconds,
            exam_type=body.exam_type,
            prompt=section.prompt,
        )
        feedback = _run_speaking_eval(eval_body)
        db.table("speaking_sessions").insert({
            "user_id": profile["id"],
            "exercise_id": eval_body.exercise_id,
            "transcript": None,
            "recording_path": section.storage_path,
            "duration_seconds": section.duration_seconds,
            "exam_type": body.exam_type,
            "ai_feedback": feedback.model_dump(),
            "cefr_level": feedback.cefrLevel,
        }).execute()
        section_results.append(
            SpeakingSectionFeedback(section_id=section.section_id, feedback=feedback)
        )
    if context == "practice":
        increment(db, profile["id"], _monday(), "speaking_eval")
    write_audit_log(db, profile["id"], "speaking_eval", context)
    return SpeakingModuleEvalResponse(sections=section_results)


@router.post("/speaking/upload-url", response_model=SpeakingUploadUrlResponse)
async def speaking_upload_url(
    profile: dict = Depends(get_profile),
):
    from supabase import create_client
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    storage_path = f"{profile['id']}/{uuid.uuid4()}.webm"
    signed = client.storage.from_("speaking-recordings").create_signed_upload_url(storage_path)
    upload_url = signed.get("signed_url") or signed.get("signedURL")
    if not upload_url:
        raise HTTPException(
            status_code=500,
            detail="Storage API did not return a signed upload URL.",
        )
    return SpeakingUploadUrlResponse(
        upload_url=upload_url,
        storage_path=storage_path,
    )


@router.post("/speaking", response_model=AISpeakingSuggestion)
async def speaking_practice(
    body: SpeakingEvalRequest,
    profile: dict = Depends(require_ai_cap("speaking_eval", "practice")),
    db=Depends(get_db),
):
    feedback = _run_speaking_eval(body)
    db.table("speaking_sessions").insert({
        "user_id": profile["id"],
        "exercise_id": body.exercise_id,
        "transcript": None,
        "recording_path": body.storage_path,
        "duration_seconds": body.duration_seconds,
        "exam_type": body.exam_type,
        "ai_feedback": feedback.model_dump(),
        "cefr_level": feedback.cefrLevel,
    }).execute()
    increment(db, profile["id"], _monday(), "speaking_eval")
    write_audit_log(db, profile["id"], "speaking_eval", "practice")
    return feedback


@router.post("/speaking/mock", response_model=AISpeakingSuggestion)
async def speaking_mock(
    body: SpeakingEvalRequest,
    profile: dict = Depends(require_ai_cap("speaking_eval", "mock")),
    db=Depends(get_db),
):
    feedback = _run_speaking_eval(body)
    db.table("speaking_sessions").insert({
        "user_id": profile["id"],
        "exercise_id": body.exercise_id,
        "transcript": None,
        "recording_path": body.storage_path,
        "duration_seconds": body.duration_seconds,
        "exam_type": body.exam_type,
        "ai_feedback": feedback.model_dump(),
        "cefr_level": feedback.cefrLevel,
    }).execute()
    write_audit_log(db, profile["id"], "speaking_eval", "mock")
    return feedback


@router.post("/speaking/module", response_model=SpeakingModuleEvalResponse)
async def speaking_module_practice(
    body: SpeakingModuleEvalRequest,
    profile: dict = Depends(require_ai_cap("speaking_eval", "practice")),
    db=Depends(get_db),
):
    return _run_speaking_module_eval(body, profile, db, "practice")


@router.post("/speaking/module/mock", response_model=SpeakingModuleEvalResponse)
async def speaking_module_mock(
    body: SpeakingModuleEvalRequest,
    profile: dict = Depends(require_ai_cap("speaking_eval", "mock")),
    db=Depends(get_db),
):
    return _run_speaking_module_eval(body, profile, db, "mock")


# ─── Study Plan ──────────────────────────────────────────────────────────────

@router.post("/study-plan", response_model=StudyPlanResponse)
async def create_study_plan(
    body: StudyPlanRequest,
    profile: dict = Depends(require_ai_cap("study_plan", "practice")),
    db=Depends(get_db),
):
    plan = generate_study_plan(
        body.exam_type, body.current_level, body.target_score,
        body.weeks_count, body.daily_minutes,
    )
    db.table("study_plans").insert({
        "user_id": profile["id"],
        "exam_type": body.exam_type,
        "current_level": body.current_level,
        "target_score": body.target_score,
        "weeks_count": body.weeks_count,
        "daily_minutes": body.daily_minutes,
        "plan_data": plan.model_dump(),
    }).execute()
    increment(db, profile["id"], _monday(), "study_plan")
    write_audit_log(db, profile["id"], "study_plan", "practice")
    return plan


# ─── Vocab Explain ───────────────────────────────────────────────────────────

@router.post("/vocab-explain", response_model=VocabExplainResponse)
async def vocab_explain(
    body: VocabExplainRequest,
    profile: dict = Depends(require_ai_cap("vocab_explain", "practice")),
    db=Depends(get_db),
):
    result = explain_vocab(body.word, body.translation, body.category)
    increment(db, profile["id"], _monday(), "vocab_explain")
    write_audit_log(db, profile["id"], "vocab_explain", "practice")
    return result
