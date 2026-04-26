# ThePlacementProject

> Placement prep that fits your life. Not the other way around.

A deterministic, timetable-aware navigation engine that generates realistic weekly study plans, adapts to missed days, and charges minimally for accountability features.

**Status**: MVP Ready for Production  
**Tech Stack**: Next.js 14 + FastAPI + Supabase + Razorpay  
**Deployment**: Vercel + Render + Supabase

---

## Features

### Free Tier
- ✅ Magic Link / Google OAuth authentication
- ✅ 5-step onboarding (college tier, branch, target roles, availability, skill level)
- ✅ Deterministic schedule generation (7-day weekly plan)
- ✅ Progress tracking (completion, streak, readiness score)
- ✅ Resource links to curated content

### Pro Tier (₹29/month)
- ✅ Auto-reschedule on missed days (preserves streak)
- ✅ Daily Telegram reminders (08:00 IST)
- ✅ Placement readiness score (weighted formula)
- ✅ Rescue mode (30-day condensed sprint)
- ✅ Ad-free UI

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account
- Razorpay account (for payments)
- Telegram bot token

### Local Development

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in .env with your credentials
uvicorn app.main:app --reload
# API runs on http://localhost:8000
```

**Frontend**:
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in .env.local with your credentials
npm run dev
# App runs on http://localhost:3000
```

**Database**:
1. Create Supabase project at https://supabase.com
2. Run migrations in SQL editor:
   - `supabase/migrations/20260406_init.sql`
   - `supabase/migrations/20260426_indexes.sql`

---

## Project Structure

```
.
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/              # Config, auth, database
│   │   ├── models/            # Pydantic schemas
│   │   ├── routes/            # API endpoints
│   │   │   ├── schedule.py    # Schedule generation & reschedule
│   │   │   ├── progress.py    # Progress tracking
│   │   │   ├── payment.py     # Razorpay integration
│   │   │   ├── profile.py     # User profiles
│   │   │   └── reminders.py   # Telegram reminders & cron
│   │   ├── data/              # Curriculum JSON
│   │   └── main.py            # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # Pages & layouts
│   │   │   ├── auth/          # Authentication
│   │   │   ├── onboarding/    # 5-step onboarding
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   └── payment/       # Payment success
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities (API, store, auth)
│   │   ├── types/             # TypeScript types
│   │   └── middleware.ts      # Route protection
│   ├── package.json
│   └── .env.local.example
│
├── supabase/                   # Database migrations
│   └── migrations/
│       ├── 20260406_init.sql  # Schema
│       └── 20260426_indexes.sql # Indexes & columns
│
├── PRD.md                      # Product requirements
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

---

## API Endpoints

### Authentication
- `POST /auth/signup` — Create account (Supabase)
- `POST /auth/signin` — Sign in (Supabase)
- `GET /auth/callback` — OAuth callback

### Profile
- `POST /api/v1/profile` — Create/update profile
- `GET /api/v1/profile` — Get user profile

### Schedule
- `POST /api/v1/schedule/generate` — Generate weekly schedule
- `GET /api/v1/schedule/current` — Get active schedule
- `POST /api/v1/schedule/reschedule` — Reschedule missed day
- `POST /api/v1/schedule/rescue-mode` — Activate 30-day sprint

### Progress
- `POST /api/v1/progress/update` — Update item status (pending/completed/skipped)

### Payment
- `POST /api/v1/payment/create-checkout` — Create Razorpay payment link
- `GET /api/v1/payment/verify/{payment_id}` — Verify payment status
- `POST /api/v1/payment/webhook` — Razorpay webhook (auto-upgrade to Pro)

### Reminders
- `POST /api/v1/reminders/subscribe-telegram` — Subscribe to Telegram reminders
- `POST /api/v1/reminders/cron/daily-reminder` — Send daily reminders (cron)
- `POST /api/v1/reminders/cron/missed-day-alert` — Send missed day alerts (cron)

---

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
TELEGRAM_BOT_TOKEN=...
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
CRON_SECRET=your-secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Key Algorithms

### Schedule Generation
1. Map target roles to priority topics (SDE → DSA > Aptitude > System Design)
2. Apply tier multiplier (Tier-3 prioritizes aptitude + easy DSA)
3. Distribute hours across available time slots
4. Cap daily load (max 2-3 hrs/day based on weekly availability)
5. Return deterministic 7-day schedule

### Readiness Score
```
Score = (Completion % × 60) + (Streak Days × 3) + 10
Max: 100
```

### Reschedule Logic
1. Find today's pending items
2. Find next available slots (tomorrow onwards)
3. Redistribute items to next slots
4. Mark today's items as 'skipped' (preserves streak)

### Rescue Mode
1. Get current schedule items
2. Duplicate items across 30 days
3. Increase daily load (3-4 items/day)
4. Mark schedule as 'rescued'

---

## Database Schema

### users
- `id` (UUID, PK)
- `email` (TEXT, unique)
- `created_at` (TIMESTAMPTZ)

### profiles
- `user_id` (UUID, FK → users.id, PK)
- `college_tier` (TEXT: Tier-1/2/3)
- `branch`, `grad_year`, `target_roles`, `skill_levels` (JSONB)
- `weekday_hrs`, `weekend_hrs`, `preferred_windows`
- `is_pro` (BOOLEAN)
- `pro_expires_at` (TIMESTAMPTZ)
- `telegram_chat_id` (TEXT)
- `updated_at` (TIMESTAMPTZ)

### schedules
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `generated_at` (TIMESTAMPTZ)
- `status` (TEXT: active/completed/rescued)

### schedule_items
- `id` (UUID, PK)
- `schedule_id` (UUID, FK)
- `day_index` (INT: 0-6)
- `time_slot` (TEXT: "18:00-19:00")
- `topic`, `difficulty`, `resource_url`
- `status` (TEXT: pending/completed/skipped)
- `updated_at` (TIMESTAMPTZ)

### payments
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `razorpay_payment_id` (TEXT, unique)
- `amount_paisa` (INT)
- `currency` (TEXT)
- `status` (TEXT: pending/success/failed)
- `created_at` (TIMESTAMPTZ)

---

## Testing

### Manual Testing Checklist
- [ ] Auth flow (Magic Link + Google OAuth)
- [ ] Onboarding (all 5 steps)
- [ ] Schedule generation (deterministic)
- [ ] Progress tracking (toggle status)
- [ ] Streak calculation (consecutive days)
- [ ] Readiness score (formula correct)
- [ ] Reschedule (redistribute items)
- [ ] Rescue mode (30-day sprint)
- [ ] Payment (Razorpay test card)
- [ ] Reminders (Telegram message)
- [ ] Pro features unlock (after payment)

### Test Credentials
- **Razorpay Test Card**: 4111111111111111 (any future date, any CVV)
- **Telegram Bot**: Message @BotFather to create test bot

---

## Performance Targets

- **LCP** < 1.5s
- **FID** < 10ms
- **CLS** < 0.1
- **API Response** < 300ms (95th percentile)
- **JS Bundle** < 180KB

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step production deployment guide.

**Quick Deploy**:
1. Backend: Push to GitHub → Render auto-deploys
2. Frontend: Push to GitHub → Vercel auto-deploys
3. Database: Migrations run manually in Supabase SQL editor
4. Cron: Setup GitHub Actions or Render Scheduler

---

## Known Limitations (Phase 1)

- ❌ No YouTube creator integration
- ❌ No AI/ML readiness predictor
- ❌ No referral program
- ❌ No mock interviews
- ❌ No multi-language support
- ❌ No light mode

These are planned for Phase 2+.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — see LICENSE file for details

---

## Support

- **Issues**: GitHub Issues
- **Email**: support@theplacementproject.com
- **Telegram**: @theplacementproject_bot

---

## Roadmap

### Phase 1 (Current)
- ✅ Auth, Onboarding, Schedule Generation
- ✅ Progress Tracking, Payment Integration
- ✅ Telegram Reminders, Rescue Mode

### Phase 2
- YouTube resource mapping (UTM tracking)
- XGBoost readiness predictor
- Campus leaderboards (opt-in)
- Referral program

### Phase 3
- Mock interview marketplace
- AI-powered difficulty adjustment
- Multi-language support
- Light mode

---

**Built with ❤️ for Indian engineering students**

Last Updated: April 2026  
Version: 1.0.0
