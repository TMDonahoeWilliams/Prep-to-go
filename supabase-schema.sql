-- Supabase Migration: College Prep Application Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase auth.users integration)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'parent')),
    profile_image_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) NOT NULL, -- chart-1, chart-2, etc.
    icon VARCHAR(50), -- lucide icon name
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    assigned_to VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (assigned_to IN ('student', 'parent')),
    helpful_link TEXT, -- URL to complete the task
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent-Student relationships
CREATE TABLE public.parent_student_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- Student invitations table
CREATE TABLE public.student_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_email TEXT NOT NULL,
    student_first_name TEXT NOT NULL,
    student_last_name TEXT NOT NULL,
    invitation_token TEXT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (for Stripe integration)
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status VARCHAR(50) NOT NULL, -- 'active', 'canceled', etc.
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT parent_id FROM public.parent_student_relations WHERE student_id = user_id
        ) OR
        auth.uid() IN (
            SELECT student_id FROM public.parent_student_relations WHERE parent_id = user_id
        )
    );

CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT parent_id FROM public.parent_student_relations WHERE student_id = user_id
        ) OR
        auth.uid() IN (
            SELECT student_id FROM public.parent_student_relations WHERE parent_id = user_id
        )
    );

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for parent-student relations
CREATE POLICY "Users can view own relations" ON public.parent_student_relations
    FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = student_id);

CREATE POLICY "Parents can create relations" ON public.parent_student_relations
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Insert default categories
INSERT INTO public.categories (id, name, description, color, icon, sort_order) VALUES
    ('cat-1', 'College Applications', 'Application deadlines, essays, and submissions', 'chart-1', 'GraduationCap', 1),
    ('cat-2', 'Financial Aid & FAFSA', 'Financial aid forms, scholarships, and FAFSA submission', 'chart-2', 'DollarSign', 2),
    ('cat-3', 'Housing & Registration', 'Dorm applications, course registration, and enrollment', 'chart-3', 'Home', 3),
    ('cat-4', 'Testing & Transcripts', 'Standardized tests, transcripts, and academic records', 'chart-4', 'BookOpen', 4),
    ('cat-5', 'Health & Documentation', 'Medical forms, insurance, and health requirements', 'chart-5', 'Heart', 5),
    ('cat-6', 'Move-In Preparation', 'Orientation, packing, and transition planning', 'chart-6', 'Package', 6);

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();