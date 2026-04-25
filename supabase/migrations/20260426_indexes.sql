-- ============================================================
-- Migration: Indexes, constraints, and Supabase Auth trigger
-- Run after 20260406_init.sql
-- ============================================================

-- 1. Performance indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id
    ON public.schedules(user_id);

CREATE INDEX IF NOT EXISTS idx_schedule_items_schedule_id
    ON public.schedule_items(schedule_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id
    ON public.payments(user_id);

-- Partial index for fast pro-user lookups (cron reminders, etc.)
CREATE INDEX IF NOT EXISTS idx_profiles_is_pro
    ON public.profiles(is_pro)
    WHERE is_pro = true;

-- 2. Add updated_at to mutable tables
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.schedule_items
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add telegram_chat_id to profiles for reminders
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- 3. Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER schedule_items_updated_at
    BEFORE UPDATE ON public.schedule_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Auto-create profile row when user signs up via Supabase Auth
-- This syncs auth.users → public.profiles (empty shell)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS policy for schedule_items update (needed for progress/update)
CREATE POLICY IF NOT EXISTS "Users can update their own schedule items"
    ON public.schedule_items FOR UPDATE
    USING (
        schedule_id IN (
            SELECT id FROM public.schedules WHERE user_id = auth.uid()
        )
    );
