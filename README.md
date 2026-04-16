# ThePlacementProject (TPP)

Placement prep that fits your life. Not the other way around.

## Vision

Replace chaotic, content-dumping platforms with a deterministic, timetable-aware navigation engine that generates realistic weekly study plans, adapts to missed days, and charges minimally for accountability features.

**Core Philosophy:** Navigation > Content. Clarity > Volume. Consistency > Perfection.

## Tech Stack

### Frontend
- Next.js 14 (App Router, React Server Components)
- Tailwind CSS 3.4+
- Framer Motion 11.x
- React Hook Form + Zod
- Lucide React (icons)
- Supabase JS SDK v2

### Backend
- FastAPI 0.110+
- Uvicorn 0.29+
- Pydantic V2
- Supabase (PostgreSQL, Auth)

### Database
- Supabase (PostgreSQL 15+)
- Row-Level Security enabled by default

### Payments
- Razorpay Payment Pages (UPI)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

### Database Setup

Run the SQL migrations in your Supabase dashboard:

```bash
# Copy the migration file content from supabase/migrations/20260406_init.sql
# Paste into Supabase SQL Editor and run
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/          # Core configuration and database
│   │   ├── models/        # Pydantic schemas
│   │   ├── routes/        # API route handlers
│   │   └── main.py        # FastAPI application entry
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and clients
│   └── package.json
├── supabase/
│   └── migrations/        # Database migrations
└── PRD.md                 # Product Requirements Document
```

## Features (Phase 1 MVP)

- ✅ Authentication (Magic Link / Google OAuth via Supabase)
- ✅ 5-Step Onboarding Flow
- ✅ Rule-Based Schedule Generator
- ✅ Weekly Dashboard with Progress Tracking
- ✅ Streak Counter
- ✅ UPI Payment Integration (Razorpay)
- ✅ WhatsApp/Telegram Reminders (configurable)

### Pro Features (₹29/month)

- Auto-Reschedule Engine
- WhatsApp Reminders
- Placement Readiness Score
- Rescue Mode (30-day condensed sprint)
- Ad-free UI

## API Endpoints

### Schedule
- `POST /api/v1/schedule/generate` - Generate weekly schedule
- `POST /api/v1/progress/update` - Update task progress

### Payment
- `POST /api/v1/payment/webhook` - Razorpay webhook handler

## Design System

**Theme:** Dark only

**Colors:**
- Background: `#0A0A0F`
- Surface: `#12121A`
- Border: `#1E1E2A`
- Primary Text: `#E8E8ED`
- Secondary Text: `#8A8A9A`
- Accent: `#6366F1`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

**Typography:** Inter font family

**Spacing:** 4px baseline grid (8, 12, 16, 24, 32, 48)

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT

---

Built with ❤️ for Indian engineering students
