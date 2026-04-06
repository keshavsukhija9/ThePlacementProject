PRODUCT OVERVIEW
Name: ThePlacementProject (TPP) Tagline: Placement prep that fits your life. Not the other way around. Vision: Replace chaotic, content-dumping platforms with a deterministic, timetable-aware navigation engine that generates realistic weekly study plans, adapts to missed days, and charges minimally for accountability features. Core Philosophy: Navigation > Content. Clarity > Volume. Consistency > Perfection. Monetization: ₹29/month via UPI only. Free tier includes basic roadmap. Pro unlocks smart scheduling, WhatsApp reminders, readiness scoring, rescue mode, and ad-free UI. Phase 1 Scope: Auth, Onboarding, Rule-Based Schedule Generator, Dashboard, Progress Tracking, UPI Payment Integration, WhatsApp/Telegram Reminders. NO external creator integrations, NO AI generation yet.
================================================================================ 2. TARGET USER & CORE FLOW ================================================================================ Primary Persona: Indian Engineering Student (Tier 1/2/3), Year 2-4, preparing for campus/off-campus placements. Juggles classes, labs, assignments, commute, and placement prep. Secondary Persona: Recent grads targeting off-campus roles with limited daily bandwidth.
Core User Journey: Landing Page -> Auth (Magic Link / Google) -> 5-Step Onboarding -> Schedule Generation -> Weekly Dashboard -> Progress Tracking -> Upgrade Prompt -> UPI Payment -> Pro Features Unlocked -> WhatsApp Reminders -> Monthly Renewal
================================================================================ 3. FEATURE SPECIFICATIONS (MVP) ================================================================================ 3.1 Authentication
Providers: Supabase Magic Link (email) + Google OAuth
Session: JWT-based, 7-day refresh
RLS: Row-level security on all user-scoped tables
Fallback: Clear error states for network/auth failures
3.2 Onboarding Flow (5 Steps, Progressive Disclosure) Step 1: College Tier (Dropdown: Tier-1, Tier-2, Tier-3) Step 2: Branch + Graduation Year (Dropdowns) Step 3: Target Roles (Multi-select: SDE, Data Engineer, Core, Startup, Quant, Other) Step 4: Weekly Availability (Manual input: Weekday hrs/day, Weekend hrs/day, Preferred windows: Morning/Afternoon/Evening/Night) Step 5: Current Skill Baseline (Self-assess: Beginner/Intermediate/Advanced for DSA, Web, Aptitude) Validation: Client-side (Zod/React Hook Form). Block submit if missing fields. Store in profiles table.
3.3 Schedule Engine (Rule-Based, Deterministic) Input: Profile constraints + public curriculum JSON Logic:
Map target roles to priority topics (e.g., SDE -> DSA > Aptitude > System Design > Projects)
Distribute hours across available slots
Apply tier multiplier (Tier-3 prioritizes aptitude + easy DSA + resume; Tier-1 adds advanced DSA + projects)
Cap daily load to prevent burnout (max 2 hrs/day for <10 hrs/week, max 3 hrs/day for 10-15 hrs/week) Output: Array of schedule_items with day, time_slot, topic, difficulty, resource_link, status Reschedule Logic: On "missed day" toggle, redistribute remaining items to next available slots without resetting streak
3.4 Dashboard Layout: 7-day grid (desktop), swipeable carousel (mobile) Components:
Header: Welcome, Streak Counter (🔥 X days), Placement Readiness % (Pro)
Day Card: Time slot -> Topic -> Status Toggle (⏳ -> ✅) -> Resource Link
Bottom CTA: "Go Pro - ₹29/mo via UPI" (persistent, non-intrusive) State: Local cache + Supabase sync on blur/interval
3.5 Pro Features (₹29/mo)
Auto-Reschedule Engine (cloud-triggered)
WhatsApp Reminders (daily prompt + weekly recap)
Placement Readiness Score (weighted formula based on completion rate + streak + target alignment)
Rescue Mode (30-day condensed sprint before placement season)
Ad-free UI (remove banner placements, faster load)
3.6 Notifications
Primary: WhatsApp Business API (cloud) or Telegram Bot fallback
Triggers: Daily study prompt (08:00 local), Missed day alert (22:00 local), Payment renewal reminder (3 days before expiry)
Fallback: In-app toast + email if opt-out
================================================================================ 4. DATA MODEL (SUPABASE / POSTGRESQL) ================================================================================ Table: users
id (uuid, pk, default gen_random_uuid())
email (text, unique, not null)
created_at (timestamptz, default now())
Table: profiles
user_id (uuid, fk -> users.id, pk)
college_tier (text, check: in ('Tier-1','Tier-2','Tier-3'))
branch (text)
grad_year (int)
target_roles (text[], default '{}')
weekday_hrs (int, check: 1-8)
weekend_hrs (int, check: 1-10)
preferred_windows (text[], check: array overlap with '{Morning,Afternoon,Evening,Night}')
skill_levels (jsonb, format: {"dsa":"beginner","aptitude":"intermediate","web":"beginner"})
is_pro (boolean, default false)
pro_expires_at (timestamptz, nullable)
Table: schedules
id (uuid, pk)
user_id (uuid, fk -> users.id)
generated_at (timestamptz)
status (text, default 'active', check: in ('active','completed','rescued'))
Table: schedule_items
id (uuid, pk)
schedule_id (uuid, fk -> schedules.id)
day_index (int, 0-6)
time_slot (text, format '18:00-19:00')
topic (text)
difficulty (text, check: in ('easy','medium','hard'))
resource_url (text)
status (text, default 'pending', check: in ('pending','completed','skipped'))
Table: payments
id (uuid, pk)
user_id (uuid, fk -> users.id)
razorpay_payment_id (text, unique)
amount_paisa (int, default 2900)
currency (text, default 'INR')
status (text, check: in ('pending','success','failed'))
created_at (timestamptz, default now())
RLS Policies: Enable on all tables. Users can only SELECT/INSERT/UPDATE rows where user_id = auth.uid(). Admin bypass disabled for Phase 1.
================================================================================ 5. API CONTRACTS (FASTAPI) ================================================================================ Endpoint: POST /api/v1/schedule/generate Request Body (Pydantic): { "college_tier": str, "target_roles": list[str], "weekday_hrs": int, "weekend_hrs": int, "preferred_windows": list[str], "skill_levels": dict } Response 200: { "schedule_id": "uuid", "items": [{"day_index": 0, "time_slot": "18:00-19:00", "topic": "...", "difficulty": "...", "resource_url": "..."}], "next_sync_at": "timestamptz" } Notes: Deterministic logic only. Cache curriculum in-memory. Return 422 on invalid input.
Endpoint: POST /api/v1/progress/update Request Body: { "item_id": "uuid", "status": "pending|completed|skipped" } Response 200: {"success": true, "streak": 5, "readiness_score": 68} Notes: Trigger recalc if status == "completed". Update streak in cache/DB.
Endpoint: POST /api/v1/payment/webhook Method: POST Headers: x-razorpay-signature (verify) Body: Razorpay standard event payload Logic:
If event == payment.captured -> set profiles.is_pro = true, profiles.pro_expires_at = now() + 30 days
If event == payment.failed -> log, send in-app notification Response 200: {"status": "ok"} Notes: Idempotent. Verify signature before DB update.
================================================================================ 6. UI/UX & DESIGN SYSTEM ================================================================================ Theme: Dark only. No light mode toggle in Phase 1. Color Palette:
bg: #0A0A0F
surface: #12121A
border: #1E1E2A
text-primary: #E8E8ED
text-secondary: #8A8A9A
accent: #6366F1
success: #10B981
warning: #F59E0B
error: #EF4444
Typography:
Font: Inter (system fallback: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
H1: 24px, 500, -0.02em
H2: 20px, 500, -0.02em
Body: 15px, 400, 1.5
Small: 13px, 400, 1.4
No decorative fonts. Strict scale.
Spacing: 4px baseline grid. 8, 12, 16, 24, 32, 48 only. Borders: 1px solid border color. No shadows in MVP. Radius: Max 8px. Buttons/Inputs: 6px. Cards: 8px. Icons: Lucide React, 18px, stroke-width 1.5, monochrome.
Component Rules:
Cards: flat, 1px border, hover changes border to accent. No elevation.
Buttons: solid accent bg, white text, 12px 20px padding, 6px radius. Disabled: opacity 0.5, pointer-events none.
Inputs: 12px 14px padding, border 1px, focus: 2px accent ring + slight scale(1.01). Error state: border error, text below.
Nav: Top bar. Logo left. Links right. Active: underline + accent tint.
Max Width: 1120px centered. Mobile: full width, 16px padding.
================================================================================ 7. ANIMATION & LOADER SPECS ================================================================================ Loader Screen Sequence (Exact):
Logo fades in (opacity 0->1, duration 0.4s, ease-out)
Text types: "Mapping your placement week..." (cursor blinks, 120ms/char, staggered)
Horizontal line draws left-to-right (width 0->120px, height 1px, accent color, duration 0.5s, ease-in-out)
Crossfade to dashboard (opacity 1->0 on loader, 0->1 on main, duration 0.3s) Total: 1.2s max. Feels intentional, not slow.
Animation Config (Framer Motion):
spring: { stiffness: 280, damping: 24, mass: 0.8 }
page transition: fade + slide-up 12px, 200ms, ease-out
hover: scale 1.02, border-color transition 150ms
status toggle: scale 1.1 -> 1.0, duration 120ms
Respect prefers-reduced-motion: disable all transitions if true.
Non-AI Design Rules:
NO glassmorphism, NO floating 3D, NO gradient blobs, NO default Tailwind presets
NO random padding/margins. All spacing divisible by 4
NO heavy shadows or blur effects
ALL states (hover, active, disabled, loading, error) explicitly defined
Performance first. Lighthouse >90. Bundle size optimized.
================================================================================ 8. PAYMENT & NOTIFICATION FLOW ================================================================================ Payment Flow:
User clicks "Go Pro - ₹29/mo"
Opens Razorpay Payment Page (UPI Intent preferred)
On success, Razorpay redirects to /payment/success?payment_id=...
Frontend polls webhook status OR calls /api/v1/payment/verify
DB updates is_pro=true, pro_expires_at=now()+30d
UI unlocks Pro features, shows success toast Fallback: Manual UPI QR with screenshot upload + admin verify (Phase 1 only, remove at 500 users)
Reminder Flow:
Cron job (GitHub Actions / Vercel Cron / Render) runs at 08:00 IST
Queries active schedules for today
Sends WhatsApp/Telegram: "Today's focus: [Topic]. Tap to mark done: [deep link]"
If status not updated by 22:00, sends: "Missed today? Tap to reschedule."
Unsubscribe link in every message
================================================================================ 9. TECHNICAL STACK & REFERENCES ================================================================================ Frontend:
Next.js 14 (App Router, React Server Components where possible)
Tailwind CSS 3.4+ (custom config, no default components)
Framer Motion 11.x (animations)
React Hook Form + Zod (validation)
Lucide React (icons)
SWR / React Query (data fetching)
Backend:
FastAPI 0.110+ (Python 3.11+)
Uvicorn 0.29+ (ASGI server)
Pydantic V2 (data validation)
HTTPX (outbound requests)
Database/Auth:
Supabase (PostgreSQL 15+, Auth, Storage, Realtime disabled for MVP)
Supabase JS SDK v2
Row-Level Security enabled by default
Payments:
Razorpay Payment Pages (no complex SDK needed)
Razorpay Webhook signature verification (hmac-sha256)
Manual fallback flow documented
Notifications:
WhatsApp Cloud API (Meta) OR Telegram Bot API (fallback)
python-telegram-bot / whatsapp-business-sdk-node (choose one)
Hosting:
Frontend: Vercel (free tier)
Backend: Render (free tier)
DB: Supabase Cloud (free tier)
Cron: GitHub Actions / Vercel Cron / Render Scheduler
================================================================================ 10. ACCEPTANCE CRITERIA & TESTING ================================================================================ Functional:
User completes onboarding in <2 mins
Schedule generates deterministically within 3 seconds
Progress toggle updates DB + streak correctly
Payment webhook updates is_pro within 10 seconds of success
Reminder fires within +/- 5 mins of scheduled time
Performance:
LCP < 1.5s, FID < 10ms, CLS < 0.1
Initial JS bundle < 180KB
API response < 300ms (95th percentile)
Accessibility:
Keyboard navigable
prefers-reduced-motion respected
Color contrast > 4.5:1 (WCAG AA)
Screen reader labels on all interactive elements
Error Handling:
Network failure: graceful toast + retry button
Invalid UPI payment: clear error state + fallback link
Missing fields: inline validation, no silent failures
================================================================================ 11. PHASE 1 BOUNDARIES & FUTURE NOTES ================================================================================ Out of Scope (Phase 1):
YouTube creator integration
AI/ML readiness predictor
Referral program
Mock interviews
Multi-language support (English only)
Light mode toggle
Future (Phase 2+):
YouTube resource mapping (UTM tracking, creator attribution)
XGBoost model for completion likelihood + dynamic difficulty adjustment
Referral loop (invite 3 -> 1 month free)
Campus leaderboards (opt-in, anonymized)
Mock interview marketplace
================================================================================ END OF PRD