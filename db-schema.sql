-- StackBill Database Schema
-- Generated from current Supabase database structure (read-only snapshot)
-- Last updated: 2025-09-09

-- Enable necessary extensions (installed in this project)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- =============================================
-- PUBLIC SCHEMA TABLES
-- =============================================

-- Admin Security Log Table (public.admin_security_log)
-- Tracks admin security actions and login attempts
CREATE TABLE public.admin_security_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin User Table (public.admin_user)
-- Stores admin user information and 2FA settings
CREATE TABLE public.admin_user (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    totp_secret VARCHAR(255),
    totp_enabled BOOLEAN DEFAULT false,
    backup_codes JSONB DEFAULT '[]',
    last_login_at TIMESTAMPTZ,
    last_2fa_at TIMESTAMPTZ,
    session_expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Notifications Table (public.email_notifications)
-- Stores email addresses for various notification signups
CREATE TABLE public.email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Email Preferences Table (public.email_preferences)
-- Stores user email notification preferences
CREATE TABLE public.email_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    monthly_summary_enabled BOOLEAN DEFAULT true,
    renewal_alerts_enabled BOOLEAN DEFAULT true,
    renewal_reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
    last_monthly_summary_sent TIMESTAMPTZ,
    last_renewal_alert_sent TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table (public.projects)
-- User-created projects for organizing subscriptions
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table (public.subscriptions)
-- User's subscription services
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    billing_period VARCHAR(50) NOT NULL,
    renewal_date DATE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT subscriptions_category_check CHECK (
        category::text = ANY (
            ARRAY[
                'Cloud & Hosting'::varchar,
                'Analytics & Monitoring'::varchar,
                'AI Tools & LLMs'::varchar,
                'Database & Storage'::varchar,
                'Developer Tools'::varchar,
                'Communication'::varchar,
                'Design & Creative'::varchar,
                'Marketing & SEO'::varchar,
                'Security'::varchar,
                'Media & Content'::varchar,
                'Productivity'::varchar,
                'Financial & Accounting'::varchar,
                'CRM & Sales'::varchar,
                'Legal & Compliance'::varchar,
                'Other'::varchar
            ]::text[]
        )
    )
);

-- Subscription Projects Junction Table (public.subscription_projects)
-- Many-to-many relationship between subscriptions and projects
CREATE TABLE public.subscription_projects (
    subscription_id UUID NOT NULL,
    project_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (subscription_id, project_id)
);

-- User Subscriptions Table (public.user_subscriptions)
-- User's plan subscriptions (Free/Pro)
CREATE TABLE public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan_type VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

-- References to auth.users
ALTER TABLE public.admin_security_log
    ADD CONSTRAINT admin_security_log_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.admin_user
    ADD CONSTRAINT admin_user_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.email_preferences
    ADD CONSTRAINT email_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.projects
    ADD CONSTRAINT projects_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Subscription Projects foreign keys
ALTER TABLE public.subscription_projects 
    ADD CONSTRAINT subscription_projects_subscription_id_fkey 
    FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;

ALTER TABLE public.subscription_projects 
    ADD CONSTRAINT subscription_projects_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================
-- INDEXES
-- =============================================

-- Admin Security Log indexes
CREATE INDEX idx_admin_security_log_user_id ON public.admin_security_log(user_id);
CREATE INDEX idx_admin_security_log_created_at ON public.admin_security_log(created_at DESC);
CREATE INDEX idx_admin_security_log_action ON public.admin_security_log(action);

-- Admin User indexes
CREATE INDEX idx_admin_user_user_id ON public.admin_user(user_id);
CREATE INDEX idx_admin_user_active ON public.admin_user(is_active) WHERE (is_active = true);

-- Email Notifications indexes
CREATE INDEX idx_email_notifications_email ON public.email_notifications(email);
CREATE INDEX idx_email_notifications_source ON public.email_notifications(source);
CREATE INDEX idx_email_notifications_email_source ON public.email_notifications(email, source);

-- Email Preferences indexes
CREATE INDEX idx_email_preferences_user_id ON public.email_preferences(user_id);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_renewal_date ON public.subscriptions(renewal_date);

-- Subscription Projects indexes
CREATE INDEX idx_subscription_projects_subscription_id ON public.subscription_projects(subscription_id);
CREATE INDEX idx_subscription_projects_project_id ON public.subscription_projects(project_id);

-- User Subscriptions indexes
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE UNIQUE INDEX idx_user_subscriptions_user_id_unique ON public.user_subscriptions(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on tables with policies
ALTER TABLE public.admin_security_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (from live database)
-- =============================================

-- Admin Security Log policies
CREATE POLICY "Admin can view own security logs" ON public.admin_security_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert security logs" ON public.admin_security_log
    FOR INSERT WITH CHECK (true);

-- Admin User policies
CREATE POLICY "Admin can view own admin record" ON public.admin_user
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can update own admin record" ON public.admin_user
    FOR UPDATE USING (user_id = auth.uid());

-- Email Notifications policies
CREATE POLICY "Allow admin reads" ON public.email_notifications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.admin_user WHERE admin_user.id = auth.uid())
    );

CREATE POLICY "Allow public inserts" ON public.email_notifications
    FOR INSERT WITH CHECK (true);

-- Email Preferences policies
CREATE POLICY "Users can view their own email preferences" ON public.email_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences" ON public.email_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences" ON public.email_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email preferences" ON public.email_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());

-- Subscription Projects policies
CREATE POLICY "Users can view their own subscription-project relationships" ON public.subscription_projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions s
            WHERE s.id = subscription_projects.subscription_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own subscription-project relationships" ON public.subscription_projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.subscriptions s
            WHERE s.id = subscription_projects.subscription_id AND s.user_id = auth.uid()
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can only see their own subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- User Subscriptions policies
CREATE POLICY "Users can only see their own app subscription" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app subscription" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app subscription" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- NOTES
-- =============================================
-- This snapshot focuses on the public schema objects and their relationships with auth.users,
-- along with live indexes and RLS policies. System schemas (auth, storage, realtime, vault)
-- are managed by Supabase and omitted here for brevity. Regenerate this file to refresh.
