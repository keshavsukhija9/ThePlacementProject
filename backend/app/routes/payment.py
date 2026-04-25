import json
import stripe
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.schemas import CheckoutCreateResponse, WebhookResponse
from app.core.auth import get_current_user
from app.core.config import settings
from app.core.db import supabase

router = APIRouter()

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout", response_model=CheckoutCreateResponse)
async def create_checkout(user: dict = Depends(get_current_user)):
    """
    Create a Stripe Checkout Session for ₹29 Pro upgrade.
    Returns a URL for the frontend to redirect to.
    """
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "inr",
                        "unit_amount": 2900,  # ₹29 in paise
                        "product_data": {
                            "name": "ThePlacementProject — Pro (1 Month)",
                            "description": "Smart scheduling, WhatsApp reminders, readiness scoring & more",
                        },
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            client_reference_id=user["id"],  # Used in webhook to identify user
            success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard",
            metadata={"user_id": user["id"], "user_email": user["email"]},
        )
        return CheckoutCreateResponse(checkout_url=session.url)
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/verify/{session_id}")
async def verify_payment(session_id: str, user: dict = Depends(get_current_user)):
    """Poll to verify payment status after Stripe redirect."""
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.client_reference_id != user["id"]:
            raise HTTPException(status_code=403, detail="Session does not belong to this user")

        if session.payment_status == "paid":
            return {"status": "success", "is_pro": True}
        elif session.status == "expired":
            return {"status": "expired", "is_pro": False}
        else:
            return {"status": "pending", "is_pro": False}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook", response_model=WebhookResponse)
async def payment_webhook(req: Request):
    """
    Stripe webhook — verifies signature and upgrades user to Pro on payment.
    Set this endpoint in Stripe Dashboard → Webhooks.
    Event: checkout.session.completed
    """
    payload = await req.body()
    sig_header = req.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")

        if not user_id:
            print("[payment] Webhook received but no client_reference_id found")
            return WebhookResponse(status="ok")

        if session.get("payment_status") == "paid":
            try:
                pro_expires = (
                    datetime.now(timezone.utc) + timedelta(days=30)
                ).isoformat()

                supabase.table("profiles").update(
                    {"is_pro": True, "pro_expires_at": pro_expires}
                ).eq("user_id", user_id).execute()

                # Log payment
                supabase.table("payments").insert(
                    {
                        "user_id": user_id,
                        "stripe_session_id": session["id"],
                        "amount_paisa": session.get("amount_total", 2900),
                        "currency": session.get("currency", "inr").upper(),
                        "status": "success",
                    }
                ).execute()

                print(f"[payment] ✅ User {user_id} upgraded to Pro")
            except Exception as e:
                print(f"[payment] DB update failed: {e}")

    elif event["type"] in ("payment_intent.payment_failed", "checkout.session.expired"):
        session = event["data"]["object"]
        user_id = session.get("client_reference_id") or session.get("metadata", {}).get("user_id")
        if user_id:
            try:
                supabase.table("payments").insert(
                    {
                        "user_id": user_id,
                        "amount_paisa": 2900,
                        "currency": "INR",
                        "status": "failed",
                    }
                ).execute()
            except Exception:
                pass

    return WebhookResponse(status="ok")
