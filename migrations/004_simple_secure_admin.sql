-- Simple but Secure Admin System with 2FA
-- Run this in Supabase SQL Editor

-- 1. Single admin user table
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

-- 2. Security audit log (simplified)
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

-- Enable RLS
ALTER TABLE public.admin_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_admin_user_user_id ON public.admin_user(user_id);
CREATE INDEX idx_admin_user_active ON public.admin_user(is_active) WHERE is_active = true;
CREATE INDEX idx_admin_security_log_user_id ON public.admin_security_log(user_id);
CREATE INDEX idx_admin_security_log_created_at ON public.admin_security_log(created_at DESC);
CREATE INDEX idx_admin_security_log_action ON public.admin_security_log(action);

-- Apply updated_at trigger
CREATE TRIGGER update_admin_user_updated_at BEFORE UPDATE ON public.admin_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (only the admin can see admin data)
CREATE POLICY "Admin can view own admin record" ON public.admin_user
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can update own admin record" ON public.admin_user
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admin can view own security logs" ON public.admin_security_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert security logs" ON public.admin_security_log
    FOR INSERT WITH CHECK (true);

-- Insert yourself as the admin (replace with your actual user ID)
-- First get your user ID: SELECT id, email FROM auth.users WHERE email = 'filippo@miralmedia.it';
INSERT INTO public.admin_user (user_id, is_active) 
VALUES (
    'YOUR_USER_ID_HERE', -- Replace with your actual user ID
    true
);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
    UPDATE public.admin_user 
    SET session_expires_at = null 
    WHERE session_expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to cleanup expired sessions
-- You can run this manually or set up a cron job
-- SELECT cleanup_expired_admin_sessions();