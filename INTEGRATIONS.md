# Integration Guide: Swipe Payments & SMS Reminders

## Overview

ThePlacementProject integrates with:
- **Swipe** for payments (UPI, Cards, Wallets)
- **Telegram** for reminders
- **SMS** via Twilio or AWS SNS

---

## Swipe Payment Integration

### Setup

#### 1. Create Swipe Account
1. Go to https://swipe.co.in
2. Sign up with business email
3. Complete KYC verification (1-2 hours)
4. Go to Dashboard → Settings → API Keys

#### 2. Get API Credentials
- **API Key** → `SWIPE_API_KEY`
- **Webhook Secret** → `SWIPE_WEBHOOK_SECRET`

#### 3. Configure Webhook
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-backend.onrender.com/api/v1/payment/webhook`
3. Select events:
   - `payment.completed`
   - `payment.failed`
4. Copy webhook secret

#### 4. Update Environment
```bash
SWIPE_API_KEY=your-api-key
SWIPE_WEBHOOK_SECRET=your-webhook-secret
```

### Payment Flow

1. User clicks "Go Pro - ₹29/month"
2. Frontend calls `POST /api/v1/payment/create-checkout`
3. Backend creates Swipe payment link
4. User redirected to Swipe payment page
5. User completes payment (UPI/Card/Wallet)
6. Swipe redirects to `/payment/success`
7. Webhook fires → Backend upgrades user to Pro
8. User sees Pro features unlocked

### Testing

**Test Card**: 4111111111111111  
**Expiry**: Any future date  
**CVV**: Any 3 digits  

**Test UPI**: Use any UPI ID (e.g., test@okhdfcbank)

### Webhook Verification

Swipe sends `x-swipe-signature` header with HMAC-SHA256 signature.

Backend verifies:
```python
expected_sig = hmac.new(
    SWIPE_WEBHOOK_SECRET.encode(),
    payload,
    hashlib.sha256
).hexdigest()

if sig_header != expected_sig:
    raise HTTPException(status_code=400, detail="Invalid signature")
```

---

## Telegram Reminders

### Setup

#### 1. Create Telegram Bot
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow prompts:
   - Bot name: "ThePlacementProject"
   - Bot username: "theplacementproject_bot"
4. Copy bot token → `TELEGRAM_BOT_TOKEN`

#### 2. Update Environment
```bash
TELEGRAM_BOT_TOKEN=your-bot-token
```

#### 3. Setup Bot Commands (Optional)
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setMyCommands \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Start reminders"},
      {"command": "stop", "description": "Stop reminders"},
      {"command": "today", "description": "Show today's tasks"}
    ]
  }'
```

### Reminder Flow

1. User subscribes to Telegram bot
2. Bot stores user's `chat_id`
3. Cron job runs at 08:00 IST
4. Backend queries Pro users with Telegram enabled
5. Sends message: "🎯 Today's Focus: [Topic]"
6. User can mark task complete via bot

### Message Format

**Daily Reminder (08:00 IST)**:
```
🎯 Today's Focus

Topic: Arrays & Strings
Time: 18:00-19:00
Resource: https://neetcode.io
```

**Missed Day Alert (22:00 IST)**:
```
⏰ Missed Today?

You have 2 pending items.
Tap to reschedule
```

### Testing

1. Message @theplacementproject_bot
2. Send `/start`
3. Bot responds with subscription confirmation
4. Manually trigger cron job:
```bash
curl -X POST http://localhost:8000/api/v1/reminders/cron/daily-reminder \
  -H "x-cron-secret: dev-secret-123"
```

---

## SMS Reminders

### Option 1: Twilio

#### Setup

1. Go to https://www.twilio.com
2. Sign up and verify phone number
3. Go to Console → Account SID & Auth Token
4. Get a Twilio phone number (e.g., +1234567890)

#### Configuration

```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Testing

```bash
# Send test SMS
curl -X POST http://localhost:8000/api/v1/reminders/cron/daily-reminder \
  -H "x-cron-secret: dev-secret-123"
```

#### Pricing
- **Outbound SMS**: $0.0075 per SMS (India)
- **Inbound SMS**: $0.0075 per SMS
- **Free trial**: $15 credit

### Option 2: AWS SNS

#### Setup

1. Go to https://aws.amazon.com/sns/
2. Create AWS account
3. Go to IAM → Users → Create user
4. Attach policy: `AmazonSNSFullAccess`
5. Create access key

#### Configuration

```bash
SMS_PROVIDER=aws_sns
AWS_SNS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

#### Testing

```bash
# Send test SMS
curl -X POST http://localhost:8000/api/v1/reminders/cron/daily-reminder \
  -H "x-cron-secret: dev-secret-123"
```

#### Pricing
- **SMS**: $0.50 per SMS (India)
- **Free tier**: 100 SMS/month for first 12 months

### Comparison

| Feature | Twilio | AWS SNS |
|---------|--------|---------|
| **Cost** | $0.0075/SMS | $0.50/SMS |
| **Setup** | Easy | Moderate |
| **Support** | Excellent | Good |
| **Reliability** | 99.95% | 99.99% |
| **Best for** | High volume | Enterprise |

**Recommendation**: Use **Twilio** for MVP (cheaper, easier setup)

---

## Cron Jobs

### Daily Reminder (08:00 IST)

**GitHub Actions**:
```yaml
# .github/workflows/daily-reminder.yml
name: Daily Reminder

on:
  schedule:
    - cron: '30 2 * * *'  # 08:00 IST = 02:30 UTC

jobs:
  reminder:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger daily reminder
        run: |
          curl -X POST https://<BACKEND_URL>/api/v1/reminders/cron/daily-reminder \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"
```

**Render Scheduler**:
1. Go to Render dashboard → Backend service
2. Click "Cron Jobs" tab
3. Add new cron job:
   - **Schedule**: `30 2 * * *` (08:00 IST)
   - **Command**: `curl -X POST https://<BACKEND_URL>/api/v1/reminders/cron/daily-reminder -H "x-cron-secret: <CRON_SECRET>"`

### Missed Day Alert (22:00 IST)

Add another cron job:
- **Schedule**: `16 16 * * *` (22:00 IST)
- **Command**: `curl -X POST https://<BACKEND_URL>/api/v1/reminders/cron/missed-day-alert -H "x-cron-secret: <CRON_SECRET>"`

---

## User Subscription Flow

### Telegram Subscription

1. User goes to Dashboard → Settings → Notifications
2. Clicks "Enable Telegram Reminders"
3. Redirected to Telegram bot: `https://t.me/theplacementproject_bot`
4. User sends `/start`
5. Bot stores `chat_id` in database
6. User sees "✅ Telegram reminders enabled"

### SMS Subscription

1. User goes to Dashboard → Settings → Notifications
2. Enters phone number (e.g., +919876543210)
3. Clicks "Enable SMS Reminders"
4. Backend validates phone number
5. Stores in database
6. User sees "✅ SMS reminders enabled"

### Unsubscribe

Users can unsubscribe via:
1. Dashboard → Settings → Disable reminders
2. Link in reminder message: `https://app.example.com/unsubscribe/{token}`

---

## Monitoring & Debugging

### Check Reminder Logs

**Backend logs**:
```bash
# Render dashboard → Logs
# Search for: [reminders], [telegram], [sms]
```

### Manual Testing

**Trigger daily reminder**:
```bash
curl -X POST http://localhost:8000/api/v1/reminders/cron/daily-reminder \
  -H "x-cron-secret: dev-secret-123"
```

**Trigger missed day alert**:
```bash
curl -X POST http://localhost:8000/api/v1/reminders/cron/missed-day-alert \
  -H "x-cron-secret: dev-secret-123"
```

**Subscribe to Telegram** (requires auth token):
```bash
curl -X POST http://localhost:8000/api/v1/reminders/subscribe-telegram \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "123456789"}'
```

**Subscribe to SMS** (requires auth token):
```bash
curl -X POST http://localhost:8000/api/v1/reminders/subscribe-sms \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543210"}'
```

### Common Issues

**Telegram message not received**:
1. Check `telegram_chat_id` is stored in database
2. Verify `TELEGRAM_BOT_TOKEN` is correct
3. Check bot is not blocked by user
4. Check cron job is running

**SMS not received**:
1. Check `phone_number` is stored in database
2. Verify SMS provider credentials
3. Check phone number format (+country_code format)
4. Check SMS provider account has credits
5. Check cron job is running

**Webhook not firing**:
1. Check webhook URL is correct in Swipe dashboard
2. Verify `SWIPE_WEBHOOK_SECRET` matches
3. Check backend logs for errors
4. Test webhook manually from Swipe dashboard

---

## Production Checklist

- [ ] Swipe API key and webhook secret configured
- [ ] Telegram bot token configured
- [ ] SMS provider (Twilio/AWS SNS) configured
- [ ] Cron jobs scheduled and tested
- [ ] Webhook URL updated in Swipe dashboard
- [ ] Database migrations run
- [ ] Error handling verified
- [ ] Monitoring/alerts configured
- [ ] Load testing completed
- [ ] Backup strategy in place

---

## Cost Estimation (Monthly)

### Swipe Payments
- **Per transaction**: ₹29 × 2% = ₹0.58
- **100 users**: ₹58/month

### Telegram Reminders
- **Cost**: Free (uses Telegram Bot API)
- **100 users × 60 reminders/month**: Free

### SMS Reminders (Twilio)
- **Per SMS**: $0.0075 (~₹0.62)
- **100 users × 60 SMS/month**: ₹3,720/month

### SMS Reminders (AWS SNS)
- **Per SMS**: $0.50 (~₹41)
- **100 users × 60 SMS/month**: ₹246,000/month ❌ (Too expensive)

**Recommendation**: Use Twilio for SMS, Telegram for free reminders

---

## Support

- **Swipe Support**: https://swipe.co.in/support
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Twilio Support**: https://www.twilio.com/help
- **AWS SNS Support**: https://aws.amazon.com/support

---

**Last Updated**: April 2026  
**Version**: 1.0.0
