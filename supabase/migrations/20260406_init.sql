-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    college_tier TEXT CHECK (college_tier IN ('Tier-1','Tier-2','Tier-3')),
    branch TEXT,
    grad_year INT,
    target_roles TEXT[] DEFAULT '{}',
    weekday_hrs INT CHECK (weekday_hrs BETWEEN 1 AND 8),
    weekend_hrs INT CHECK (weekend_hrs BETWEEN 1 AND 10),
    preferred_windows TEXT[] CHECK (preferred_windows <@ ARRAY['Morning','Afternoon','Evening','Night']::TEXT[]),
    skill_levels JSONB,
    is_pro BOOLEAN DEFAULT false,
    pro_expires_at TIMESTAMPTZ
);

-- Create schedules table
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    generated_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','rescued'))
);

-- Create schedule_items table
CREATE TABLE public.schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    day_index INT CHECK (day_index BETWEEN 0 AND 6),
    time_slot TEXT,
    topic TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
    resource_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','skipped'))
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    razorpay_payment_id TEXT UNIQUE,
    amount_paisa INT DEFAULT 2900,
    currency TEXT DEFAULT 'INR',
    status TEXT CHECK (status IN ('pending','success','failed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies (Users can only SELECT/INSERT/UPDATE their own rows)
CREATE POLICY "Users can manage their own data" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own schedules" ON public.schedules
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own schedule items" ON public.schedule_items
    FOR ALL USING (
        schedule_id IN (SELECT id FROM public.schedules WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can manage their own payments" ON public.payments
    FOR ALL USING (auth.uid() = user_id);
