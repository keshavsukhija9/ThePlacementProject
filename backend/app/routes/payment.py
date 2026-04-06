from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()

class WebhookResponse(BaseModel):
    status: str

@router.post("/webhook", response_model=WebhookResponse)
async def payment_webhook(req: Request):
    # In real world: 
    # 1. verify headers x-razorpay-signature 
    # 2. update profiles.is_pro = true
    
    payload = await req.json()
    print("Received Razorpay Webhook payload:", payload)
    
    return WebhookResponse(status="ok")
