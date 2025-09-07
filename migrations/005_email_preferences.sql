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

-- Enable Row Level Security
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX idx_email_preferences_user_id ON public.email_preferences(user_id);

-- RLS Policies for email_preferences
CREATE POLICY "Users can view their own email preferences" ON public.email_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences" ON public.email_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences" ON public.email_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email preferences" ON public.email_preferences
    FOR DELETE USING (auth.uid() = user_id);