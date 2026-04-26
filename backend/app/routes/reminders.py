import os
import requests
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header
from app.core.auth import get_current_user
from app.core.config import settings
from app.core.db import supabase

router = APIRouter()


def send_sms(phone_number: str, message: str) -> bool:
    """Send SMS via Twilio or AWS SNS."""
    try:
        if settings.SMS_PROVIDER == "twilio":
            return send_sms_twilio(phone_number, message)
        elif settings.SMS_PROVIDER == "aws_sns":
            return send_sms_aws(phone_number, message)
        else:
            print(f"[sms] Unknown SMS provider: {settings.SMS_PROVIDER}")
            return False
    except Exception as e:
        print(f"[sms] Send failed: {e}")
        return False


def send_sms_twilio(phone_number: str, message: str) -> bool:
    """Send SMS via Twilio."""
    try:
        from twilio.rest import Client
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        return msg.sid is not None
    except Exception as e:
        print(f"[twilio] Send failed: {e}")
        return False


def send_sms_aws(phone_number: str, message: str) -> bool:
    """Send SMS via AWS SNS."""
    try:
        import boto3
        
        client = boto3.client(
            'sns',
            region_name=settings.AWS_SNS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        response = client.publish(
            PhoneNumber=phone_number,
            Message=message
        )
        return 'MessageId' in response
    except Exception as e:
        print(f"[aws_sns] Send failed: {e}")
        return False


def send_telegram_message(chat_id: str, message: str) -> bool:
    """Send message via Telegram Bot API."""
    try:
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"[telegram] Send failed: {e}")
        return False


@router.post("/subscribe-telegram")
async def subscribe_telegram(
    chat_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Store Telegram chat_id for user to enable reminders.
    Called when user clicks Telegram bot link.
    """
    try:
        supabase.table("profiles").update(
            {"telegram_chat_id": chat_id}
        ).eq("user_id", user["id"]).execute()
        
        return {"status": "subscribed", "message": "Telegram reminders enabled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscribe-sms")
async def subscribe_sms(
    phone_number: str,
    user: dict = Depends(get_current_user)
):
    """
    Store phone number for user to enable SMS reminders.
    """
    try:
        # Validate phone number format (basic check)
        if not phone_number.startswith("+") or len(phone_number) < 10:
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        
        supabase.table("profiles").update(
            {"phone_number": phone_number}
        ).eq("user_id", user["id"]).execute()
        
        return {"status": "subscribed", "message": "SMS reminders enabled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/unsubscribe/{token}")
async def unsubscribe_reminders(token: str):
    """
    Unsubscribe from reminders using token from email/message.
    Token format: base64(user_id:timestamp)
    """
    try:
        import base64
        decoded = base64.b64decode(token).decode()
        user_id = decoded.split(":")[0]
        
        supabase.table("profiles").update(
            {"telegram_chat_id": None, "phone_number": None}
        ).eq("user_id", user_id).execute()
        
        return {"status": "unsubscribed", "message": "All reminders disabled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid unsubscribe token")


@router.post("/cron/daily-reminder")
async def daily_reminder_cron(x_cron_secret: str = Header(None)):
    """
    Cron job to send daily reminders at 08:00 IST.
    Sends via Telegram and/or SMS based on user preferences.
    Protected by CRON_SECRET header.
    """
    
    # Verify cron secret
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        # Get all Pro users with notification preferences
        result = supabase.table("profiles").select(
            "user_id, telegram_chat_id, phone_number, target_roles"
        ).eq("is_pro", True).execute()
        
        pro_users = result.data or []
        sent_count = 0
        failed_count = 0
        
        for profile in pro_users:
            user_id = profile["user_id"]
            chat_id = profile.get("telegram_chat_id")
            phone = profile.get("phone_number")
            
            # Skip if no notification method enabled
            if not chat_id and not phone:
                continue
            
            try:
                # Get today's schedule items
                today_idx = datetime.now(timezone.utc).weekday()
                schedule_result = supabase.table("schedule_items").select(
                    "id, topic, time_slot, resource_url, status"
                ).eq("schedules.user_id", user_id).eq("schedules.status", "active").eq(
                    "day_index", today_idx
                ).execute()
                
                items = schedule_result.data or []
                
                if not items:
                    continue
                
                # Build message
                pending_items = [i for i in items if i["status"] == "pending"]
                if not pending_items:
                    continue
                
                first_item = pending_items[0]
                message = (
                    f"🎯 Today's Focus\n\n"
                    f"Topic: {first_item['topic']}\n"
                    f"Time: {first_item['time_slot']}\n"
                    f"Resource: {first_item['resource_url']}"
                )
                
                # Send via Telegram
                if chat_id:
                    if send_telegram_message(chat_id, message):
                        sent_count += 1
                
                # Send via SMS
                if phone:
                    sms_message = f"🎯 Today's focus: {first_item['topic']} at {first_item['time_slot']}"
                    if send_sms(phone, sms_message):
                        sent_count += 1
                
            except Exception as e:
                print(f"[reminders] Failed to send to user {user_id}: {e}")
                failed_count += 1
        
        return {
            "status": "ok",
            "sent": sent_count,
            "failed": failed_count,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        print(f"[reminders] Cron job error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cron/missed-day-alert")
async def missed_day_alert_cron(x_cron_secret: str = Header(None)):
    """
    Cron job to send missed day alerts at 22:00 IST.
    Reminds users who haven't completed today's items.
    Sends via Telegram and/or SMS.
    """
    
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        # Get all Pro users with notification preferences
        result = supabase.table("profiles").select(
            "user_id, telegram_chat_id, phone_number"
        ).eq("is_pro", True).execute()
        
        pro_users = result.data or []
        sent_count = 0
        
        for profile in pro_users:
            user_id = profile["user_id"]
            chat_id = profile.get("telegram_chat_id")
            phone = profile.get("phone_number")
            
            # Skip if no notification method enabled
            if not chat_id and not phone:
                continue
            
            try:
                # Check if user has pending items today
                today_idx = datetime.now(timezone.utc).weekday()
                schedule_result = supabase.table("schedule_items").select(
                    "id, status"
                ).eq("schedules.user_id", user_id).eq("schedules.status", "active").eq(
                    "day_index", today_idx
                ).eq("status", "pending").execute()
                
                pending_items = schedule_result.data or []
                
                if pending_items:
                    message = (
                        f"⏰ Missed Today?\n\n"
                        f"You have {len(pending_items)} pending items.\n"
                        f"Tap to reschedule"
                    )
                    
                    # Send via Telegram
                    if chat_id:
                        send_telegram_message(chat_id, message)
                    
                    # Send via SMS
                    if phone:
                        sms_message = f"⏰ You have {len(pending_items)} pending items today. Reschedule now!"
                        send_sms(phone, sms_message)
                    
                    sent_count += 1
            
            except Exception as e:
                print(f"[reminders] Missed day alert failed for {user_id}: {e}")
        
        return {
            "status": "ok",
            "sent": sent_count,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        print(f"[reminders] Missed day alert cron error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
