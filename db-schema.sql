-- StackBill Database Schema
-- Generated from current Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User subscriptions table (for managing user plan subscriptions)
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR,
    stripe_subscription_id VARCHAR,
    plan_type VARCHAR DEFAULT 'free',
    status VARCHAR DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions table (for tracking individual service subscriptions)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    amount NUMERIC NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    billing_period VARCHAR NOT NULL,
    renewal_date DATE NOT NULL,
    description TEXT,
    category VARCHAR CHECK (category IN (
        'Cloud & Hosting',
        'Analytics & Tracking',
        'AI & Machine Learning',
        'Database & Storage',
        'Developer Tools',
        'Communication',
        'Design & Creative',
        'Marketing & SEO',
        'Security',
        'Entertainment',
        'Productivity',
        'Other'
    )),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table for many-to-many relationship between subscriptions and projects
CREATE TABLE public.subscription_projects (
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (subscription_id, project_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_projects ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_renewal_date ON public.subscriptions(renewal_date);
CREATE INDEX idx_subscription_projects_subscription_id ON public.subscription_projects(subscription_id);
CREATE INDEX idx_subscription_projects_project_id ON public.subscription_projects(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for projects table
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for user_subscriptions table
CREATE POLICY "Users can view their own user subscriptions" ON public.user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own user subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own user subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own user subscriptions" ON public.user_subscriptions
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for subscription_projects table
CREATE POLICY "Users can view their own subscription-project relationships" ON public.subscription_projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions s 
            WHERE s.id = subscription_projects.subscription_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own subscription-project relationships" ON public.subscription_projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.subscriptions s 
            WHERE s.id = subscription_projects.subscription_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own subscription-project relationships" ON public.subscription_projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions s 
            WHERE s.id = subscription_projects.subscription_id 
            AND s.user_id = auth.uid()
        )
    );
