import json
import hmac
import hashlib
import requests
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.schemas import CheckoutCreateResponse, WebhookResponse
from app.core.auth import get_current_user
from app.core.config import settings
from app.core.db import supabase

router = APIRouter()


@router.post("/create-checkout", response_model=CheckoutCreateResponse)
async def create_checkout(user: dict = Depends(get_current_user)):
    """
    Create a Swipe Payment Link for ₹29 Pro upgrade.
    Swipe supports UPI, Cards, and Wallets.
    Returns a URL for the frontend to redirect to.
    """
    try:
        # Swipe Payment Link API
        url = "https://api.swipe.co.in/v1/payment_links"
        
        payload = {
            "amount": 2900,  # ₹29 in paise
            "currency": "INR",
            "description": "ThePlacementProject — Pro (1 Month)",
            "customer": {
                "email": user["email"],
                "phone": user.get("phone", ""),
            },
            "notes": {
                "user_id": user["id"],
                "user_email": user["email"]
            },
            "callback_url": f"{settings.FRONTEND_URL}/payment/success",
            "notify": {
                "sms": True,
                "email": True
            }
        }
        
        response = requests.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.SWIPE_API_KEY}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        if response.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail="Failed to create payment link")
        
        data = response.json()
        return CheckoutCreateResponse(checkout_url=data["short_url"])
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Payment service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/verify/{payment_id}")
async def verify_payment(payment_id: str, user: dict = Depends(get_current_user)):
    """Verify payment status after Swipe redirect."""
    try:
        # Fetch payment details from Swipe
        url = f"https://api.swipe.co.in/v1/payments/{payment_id}"
        response = requests.get(
            url,
            headers={
                "Authorization": f"Bearer {settings.SWIPE_API_KEY}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        if response.status_code != 200:
            return {"status": "failed", "is_pro": False}
        
        payment = response.json()
        
        if payment.get("status") == "completed":
            return {"status": "success", "is_pro": True}
        elif payment.get("status") == "failed":
            return {"status": "failed", "is_pro": False}
        else:
            return {"status": "pending", "is_pro": False}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook", response_model=WebhookResponse)
async def payment_webhook(req: Request):
    """
    Swipe webhook — verifies signature and upgrades user to Pro on payment.
    Set this endpoint in Swipe Dashboard → Settings → Webhooks.
    Event: payment.completed, payment.failed
    """
    try:
        payload = await req.body()
        sig_header = req.headers.get("x-swipe-signature", "")
        
        # Verify Swipe signature (HMAC-SHA256)
        expected_signature = hmac.new(
            settings.SWIPE_WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        if sig_header != expected_signature:
            raise HTTPException(status_code=400, detail="Invalid Swipe signature")
        
        event = json.loads(payload)
        event_type = event.get("event")
        payment_data = event.get("data", {})
        
        if event_type == "payment.completed":
            payment_id = payment_data.get("id")
            user_id = payment_data.get("notes", {}).get("user_id")
            user_email = payment_data.get("notes", {}).get("user_email")
            
            if not user_id:
                print("[payment] Webhook received but no user_id in notes")
                return WebhookResponse(status="ok")
            
            try:
                pro_expires = (
                    datetime.now(timezone.utc) + timedelta(days=30)
                ).isoformat()
                
                # Update profile to Pro
                supabase.table("profiles").update(
                    {"is_pro": True, "pro_expires_at": pro_expires}
                ).eq("user_id", user_id).execute()
                
                # Log payment
                supabase.table("payments").insert(
                    {
                        "user_id": user_id,
                        "swipe_payment_id": payment_id,
                        "amount_paisa": payment_data.get("amount", 2900),
                        "currency": payment_data.get("currency", "INR"),
                        "status": "success",
                    }
                ).execute()
                
                print(f"[payment] ✅ User {user_id} upgraded to Pro via {payment_id}")
            except Exception as e:
                print(f"[payment] DB update failed: {e}")
        
        elif event_type == "payment.failed":
            payment_id = payment_data.get("id")
            user_id = payment_data.get("notes", {}).get("user_id")
            
            if user_id:
                try:
                    supabase.table("payments").insert(
                        {
                            "user_id": user_id,
                            "swipe_payment_id": payment_id,
                            "amount_paisa": payment_data.get("amount", 2900),
                            "currency": payment_data.get("currency", "INR"),
                            "status": "failed",
                        }
                    ).execute()
                except Exception as e:
                    print(f"[payment] Failed payment log error: {e}")
        
        return WebhookResponse(status="ok")
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        print(f"[payment] Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
