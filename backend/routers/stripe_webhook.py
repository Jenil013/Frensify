from fastapi import APIRouter, Depends, HTTPException, Request

from config import settings
from database import get_db
from services.stripe_service import apply_subscription_event
import stripe

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/webhook")
async def stripe_webhook(request: Request, db=Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header.")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.stripe_webhook_secret,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid payload.") from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid signature.") from exc

    apply_subscription_event(db, event)
    return {"received": True}
