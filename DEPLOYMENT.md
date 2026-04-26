# ThePlacementProject — Deployment Guide

## Overview

This guide covers deploying ThePlacementProject to production using:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **Cron Jobs**: GitHub Actions or Render Scheduler

---

## Prerequisites

1. **Accounts Created**:
   - Supabase (https://supabase.com)
   - Razorpay (https://razorpay.com) — for payments
   - Telegram Bot (https://t.me/BotFather) — for reminders
   - Vercel (https://vercel.com) — for frontend
   - Render (https://render.com) — for backend
   - GitHub (https://github.com) — for cron jobs

2. **Local Setup**:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project name, password, region (choose closest to India: Singapore or Mumbai)
4. Wait for project to initialize (~2 mins)

### 1.2 Run Migrations
1. Go to SQL Editor in Supabase dashboard
2. Copy-paste contents of `supabase/migrations/20260406_init.sql`
3. Run the query
4. Copy-paste contents of `supabase/migrations/20260426_indexes.sql`
5. Run the query

### 1.3 Get Credentials
1. Go to Settings → API
2. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `Service Role Secret` → `SUPABASE_KEY` (NOT anon key)

### 1.4 Enable Auth
1. Go to Authentication → Providers
2. Enable "Email" (Magic Link)
3. Enable "Google" (OAuth)
   - Get Google OAuth credentials from https://console.cloud.google.com
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

---

## Step 2: Razorpay Setup

### 2.1 Create Account
1. Go to https://razorpay.com
2. Sign up with business email
3. Complete KYC verification (takes 1-2 hours)

### 2.2 Get API Keys
1. Go to Settings → API Keys
2. Copy:
   - `Key ID` → `RAZORPAY_KEY_ID`
   - `Key Secret` → `RAZORPAY_KEY_SECRET`

### 2.3 Setup Webhook
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-backend.onrender.com/api/v1/payment/webhook`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
4. Copy webhook secret → `RAZORPAY_WEBHOOK_SECRET`

---

## Step 3: Telegram Bot Setup

### 3.1 Create Bot
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow prompts to create bot
4. Copy bot token → `TELEGRAM_BOT_TOKEN`

### 3.2 Setup Webhook (Optional)
For production, set webhook instead of polling:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d url=https://your-backend.onrender.com/api/v1/reminders/telegram-webhook
```

---

## Step 4: Backend Deployment (Render)

### 4.1 Prepare Repository
```bash
# Create .env file (don't commit!)
cp backend/.env.example backend/.env

# Fill in all values from previous steps
# SUPABASE_URL=...
# SUPABASE_KEY=...
# RAZORPAY_KEY_ID=...
# etc.
```

### 4.2 Deploy to Render
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Fill in:
   - **Name**: `theplacementproject-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3.11`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click "Advanced" and add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `TELEGRAM_BOT_TOKEN`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `ENVIRONMENT=production`
   - `CRON_SECRET=<generate-random-secret>`
6. Click "Create Web Service"
7. Wait for deployment (~5 mins)
8. Copy the deployed URL → `BACKEND_URL`

### 4.3 Update Razorpay Webhook
1. Go to Razorpay dashboard → Settings → Webhooks
2. Update webhook URL to: `https://<BACKEND_URL>/api/v1/payment/webhook`

---

## Step 5: Frontend Deployment (Vercel)

### 5.1 Prepare Environment
```bash
# Create .env.local (don't commit!)
cp frontend/.env.local.example frontend/.env.local

# Fill in:
NEXT_PUBLIC_SUPABASE_URL=<SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
NEXT_PUBLIC_API_URL=<BACKEND_URL>
```

### 5.2 Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import GitHub repository
4. Select `frontend` as root directory
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
6. Click "Deploy"
7. Wait for deployment (~3 mins)
8. Copy the deployed URL → `FRONTEND_URL`

### 5.3 Update Supabase Auth Redirect
1. Go to Supabase → Authentication → URL Configuration
2. Add redirect URL: `https://<FRONTEND_URL>/auth/callback`

### 5.4 Update Backend CORS
1. Go to Render dashboard → Backend service
2. Update environment variable `FRONTEND_URL` to `https://<FRONTEND_URL>`
3. Redeploy

---

## Step 6: Setup Cron Jobs

### 6.1 Daily Reminders (08:00 IST)

**Option A: GitHub Actions**
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

**Option B: Render Scheduler**
1. Go to Render dashboard → Backend service
2. Click "Cron Jobs" tab
3. Add new cron job:
   - **Schedule**: `30 2 * * *` (08:00 IST)
   - **Command**: `curl -X POST https://<BACKEND_URL>/api/v1/reminders/cron/daily-reminder -H "x-cron-secret: <CRON_SECRET>"`

### 6.2 Missed Day Alert (22:00 IST)

Add another cron job:
- **Schedule**: `16 16 * * *` (22:00 IST)
- **Command**: `curl -X POST https://<BACKEND_URL>/api/v1/reminders/cron/missed-day-alert -H "x-cron-secret: <CRON_SECRET>"`

---

## Step 7: Verify Deployment

### 7.1 Test Backend
```bash
curl https://<BACKEND_URL>/health
# Should return: {"status":"ok","env":"production"}
```

### 7.2 Test Frontend
1. Open `https://<FRONTEND_URL>`
2. Click "Sign In"
3. Enter email and verify magic link
4. Complete onboarding
5. Verify schedule loads

### 7.3 Test Payment
1. Go to Dashboard → "Go Pro"
2. Click payment button
3. Complete Razorpay payment (use test card: 4111111111111111)
4. Verify Pro features unlock

### 7.4 Test Reminders
1. Subscribe to Telegram bot: `https://t.me/<BOT_USERNAME>`
2. Send `/start` to bot
3. Wait for 08:00 IST or manually trigger cron job
4. Verify message received

---

## Monitoring & Maintenance

### Logs
- **Frontend**: Vercel dashboard → Deployments → Logs
- **Backend**: Render dashboard → Logs
- **Database**: Supabase dashboard → Logs

### Alerts
- Set up Render alerts for failed deployments
- Set up Vercel alerts for build failures
- Monitor Razorpay webhook failures

### Backups
- Supabase automatically backs up daily
- Export data weekly: Supabase → Database → Backups

---

## Troubleshooting

### Payment Webhook Not Firing
1. Check Razorpay webhook URL is correct
2. Verify `RAZORPAY_WEBHOOK_SECRET` matches
3. Check backend logs for errors
4. Test webhook manually from Razorpay dashboard

### Reminders Not Sending
1. Verify `TELEGRAM_BOT_TOKEN` is correct
2. Check cron job is running (check logs)
3. Verify user has `telegram_chat_id` set
4. Test manually: `curl -X POST https://<BACKEND_URL>/api/v1/reminders/cron/daily-reminder -H "x-cron-secret: <CRON_SECRET>"`

### Auth Not Working
1. Verify Supabase credentials in frontend
2. Check redirect URL in Supabase auth config
3. Verify CORS is configured correctly
4. Check browser console for errors

### Database Connection Failed
1. Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
2. Check Supabase project is active
3. Verify IP whitelist (if applicable)
4. Check database logs in Supabase

---

## Production Checklist

- [ ] All environment variables set correctly
- [ ] CORS configured for production domain
- [ ] Razorpay webhook URL updated
- [ ] Supabase auth redirect URL updated
- [ ] Cron jobs scheduled and tested
- [ ] Payment flow tested end-to-end
- [ ] Reminders tested end-to-end
- [ ] Error handling verified
- [ ] Monitoring/alerts configured
- [ ] Backup strategy in place
- [ ] SSL certificate valid (auto-managed by Vercel/Render)
- [ ] Rate limiting configured (if needed)

---

## Scaling Considerations

### Database
- Monitor Supabase usage
- Upgrade plan if approaching limits
- Add indexes for slow queries

### Backend
- Monitor Render CPU/memory usage
- Upgrade instance type if needed
- Consider load balancing for high traffic

### Frontend
- Monitor Vercel bandwidth usage
- Optimize bundle size
- Enable caching headers

---

## Support

For issues:
1. Check logs in respective dashboards
2. Review error messages in browser console
3. Test API endpoints manually with curl
4. Check GitHub issues for similar problems
5. Contact support for respective services

---

**Last Updated**: April 2026
**Version**: 1.0.0
