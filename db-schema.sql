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
        'Analytics & Monitoring',
        'AI Tools & LLMs',
        'Database & Storage',
        'Developer Tools',
        'Communication',
        'Design & Creative',
        'Marketing & SEO',
        'Security',
        'Media & Content',
        'Productivity',
        'Financial & Accounting',
        'CRM & Sales',
        'Legal & Compliance',
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

-- Email Preferences table for managing user email notification settings
CREATE TABLE public.email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Monthly summary email preferences
    monthly_summary_enabled BOOLEAN DEFAULT true,
    
    -- Renewal alert preferences
    renewal_alerts_enabled BOOLEAN DEFAULT true,
    renewal_reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before renewal to send alerts
    
    -- Anti-spam settings
    last_monthly_summary_sent TIMESTAMPTZ,
    last_renewal_alert_sent TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin user table (for managing admin access with 2FA)
CREATE TABLE public.admin_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    is_active BOOLEAN DEFAULT true,
    
    -- 2FA Settings
    totp_secret VARCHAR, -- Google Authenticator secret
    totp_enabled BOOLEAN DEFAULT false,
    backup_codes JSONB DEFAULT '[]'::jsonb, -- Array of backup codes
    
    -- Security
    last_login_at TIMESTAMPTZ,
    last_2fa_at TIMESTAMPTZ,
    session_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Security audit log (for tracking admin actions)
CREATE TABLE public.admin_security_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL, -- 'login', 'logout', '2fa_setup', 'dashboard_access', 'failed_login', etc.
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_renewal_date ON public.subscriptions(renewal_date);
CREATE INDEX idx_subscription_projects_subscription_id ON public.subscription_projects(subscription_id);
CREATE INDEX idx_subscription_projects_project_id ON public.subscription_projects(project_id);
CREATE INDEX idx_email_preferences_user_id ON public.email_preferences(user_id);
CREATE INDEX idx_admin_user_user_id ON public.admin_user(user_id);
CREATE INDEX idx_admin_user_active ON public.admin_user(is_active) WHERE is_active = true;
CREATE INDEX idx_admin_security_log_user_id ON public.admin_security_log(user_id);
CREATE INDEX idx_admin_security_log_created_at ON public.admin_security_log(created_at DESC);
CREATE INDEX idx_admin_security_log_action ON public.admin_security_log(action);

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

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON public.email_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_user_updated_at BEFORE UPDATE ON public.admin_user
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

-- RLS Policies for email_preferences table
CREATE POLICY "Users can view their own email preferences" ON public.email_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences" ON public.email_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences" ON public.email_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email preferences" ON public.email_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_user table
CREATE POLICY "Admin can view own admin record" ON public.admin_user
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can update own admin record" ON public.admin_user
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for admin_security_log table
CREATE POLICY "Admin can view own security logs" ON public.admin_security_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert security logs" ON public.admin_security_log
    FOR INSERT WITH CHECK (true);

-- Function to cleanup expired admin sessions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
    UPDATE public.admin_user 
    SET session_expires_at = null 
    WHERE session_expires_at < now();
END;
$$ LANGUAGE plpgsql;
