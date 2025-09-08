-- StackBill Database Schema
-- Generated from current Supabase database structure
-- Last updated: 2025-01-27

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PUBLIC SCHEMA TABLES
-- =============================================

-- Admin Security Log Table
-- Tracks admin security actions and login attempts
CREATE TABLE public.admin_security_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    success BOOLEAN,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin User Table
-- Stores admin user information and 2FA settings
CREATE TABLE public.admin_user (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    totp_enabled BOOLEAN DEFAULT false,
    totp_secret VARCHAR(255),
    backup_codes JSONB,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_2fa_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    session_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Preferences Table
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

-- Email Notifications Table
-- Stores email addresses for various notification signups
CREATE TABLE public.email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'team-plan', 'newsletter', 'beta-features', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Projects Table
-- User-created projects for organizing subscriptions
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
-- User's subscription services
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
    category VARCHAR(100) NOT NULL,
    renewal_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Projects Junction Table
-- Many-to-many relationship between subscriptions and projects
CREATE TABLE public.subscription_projects (
    subscription_id UUID NOT NULL,
    project_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (subscription_id, project_id)
);

-- User Subscriptions Table
-- User's plan subscriptions (Free/Pro)
CREATE TABLE public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'pro'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Admin Security Log indexes
CREATE INDEX idx_admin_security_log_user_id ON public.admin_security_log(user_id);
CREATE INDEX idx_admin_security_log_created_at ON public.admin_security_log(created_at);

-- Email Notifications indexes
CREATE INDEX idx_email_notifications_source ON public.email_notifications(source);
CREATE INDEX idx_email_notifications_email ON public.email_notifications(email);
CREATE INDEX idx_email_notifications_email_source ON public.email_notifications(email, source);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_renewal_date ON public.subscriptions(renewal_date);
CREATE INDEX idx_subscriptions_category ON public.subscriptions(category);
CREATE INDEX idx_subscriptions_is_active ON public.subscriptions(is_active);

-- Subscription Projects indexes
CREATE INDEX idx_subscription_projects_subscription_id ON public.subscription_projects(subscription_id);
CREATE INDEX idx_subscription_projects_project_id ON public.subscription_projects(project_id);

-- User Subscriptions indexes
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_type ON public.user_subscriptions(plan_type);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

-- Subscription Projects foreign keys
ALTER TABLE public.subscription_projects 
    ADD CONSTRAINT fk_subscription_projects_subscription_id 
    FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;

ALTER TABLE public.subscription_projects 
    ADD CONSTRAINT fk_subscription_projects_project_id 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.admin_security_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Admin Security Log policies
CREATE POLICY "Admin users can view security logs" ON public.admin_security_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_user 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admin users can insert security logs" ON public.admin_security_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_user 
            WHERE user_id = auth.uid()
        )
    );

-- Admin User policies
CREATE POLICY "Admin users can view admin users" ON public.admin_user
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_user 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admin users can update admin users" ON public.admin_user
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_user 
            WHERE user_id = auth.uid()
        )
    );

-- Email Preferences policies
CREATE POLICY "Users can view their own email preferences" ON public.email_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own email preferences" ON public.email_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own email preferences" ON public.email_preferences
    FOR UPDATE USING (user_id = auth.uid());

-- Email Notifications policies
CREATE POLICY "Allow public inserts" ON public.email_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin reads" ON public.email_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_user 
            WHERE user_id = auth.uid()
        )
    );

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
    FOR DELETE USING (user_id = auth.uid());

-- Subscription Projects policies
CREATE POLICY "Users can view subscription projects for their subscriptions" ON public.subscription_projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE id = subscription_projects.subscription_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert subscription projects for their subscriptions" ON public.subscription_projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE id = subscription_projects.subscription_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete subscription projects for their subscriptions" ON public.subscription_projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE id = subscription_projects.subscription_id 
            AND user_id = auth.uid()
        )
    );

-- User Subscriptions policies
CREATE POLICY "Users can view their own user subscriptions" ON public.user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own user subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own user subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- PERMISSIONS
-- =============================================

-- Grant permissions for anonymous users
GRANT INSERT ON public.email_notifications TO anon;

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.subscription_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.email_preferences TO authenticated;

-- Grant permissions for admin users
GRANT SELECT, INSERT ON public.admin_security_log TO authenticated;
GRANT SELECT, UPDATE ON public.admin_user TO authenticated;
GRANT SELECT ON public.email_notifications TO authenticated;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to cleanup expired admin sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.admin_user 
    SET session_expires_at = NULL 
    WHERE session_expires_at < NOW();
END;
$$;

-- =============================================
-- COMMENTS
-- =============================================

-- Table comments
COMMENT ON TABLE public.admin_security_log IS 'Tracks admin security actions and login attempts';
COMMENT ON TABLE public.admin_user IS 'Stores admin user information and 2FA settings';
COMMENT ON TABLE public.email_preferences IS 'Stores user email notification preferences';
COMMENT ON TABLE public.email_notifications IS 'Stores email addresses for various notification signups and marketing purposes';
COMMENT ON TABLE public.projects IS 'User-created projects for organizing subscriptions';
COMMENT ON TABLE public.subscriptions IS 'User subscription services and billing information';
COMMENT ON TABLE public.subscription_projects IS 'Many-to-many relationship between subscriptions and projects';
COMMENT ON TABLE public.user_subscriptions IS 'User plan subscriptions (Free/Pro) with Stripe integration';

-- Column comments
COMMENT ON COLUMN public.email_notifications.source IS 'Identifies where the email came from: team-plan, newsletter, beta-features, etc.';
COMMENT ON COLUMN public.email_notifications.metadata IS 'Extensible JSON field for future data like plan preferences, user info, etc.';
COMMENT ON COLUMN public.projects.color IS 'Hex color code for project identification';
COMMENT ON COLUMN public.subscriptions.billing_period IS 'Billing frequency: weekly, monthly, quarterly, yearly';
COMMENT ON COLUMN public.subscriptions.category IS 'Subscription category for organization';
COMMENT ON COLUMN public.user_subscriptions.plan_type IS 'User plan type: free or pro';
COMMENT ON COLUMN public.user_subscriptions.status IS 'Subscription status: active, canceled, past_due';
