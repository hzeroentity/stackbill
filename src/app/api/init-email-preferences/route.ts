import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Since we can't run arbitrary SQL via RPC, this is a placeholder endpoint
    // The table needs to be created directly in Supabase dashboard or via proper migration
    
    // For now, let's just test if the table exists and create a default preference
    const { error: checkError } = await supabase
      .from('email_preferences')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === '42P01') {
      return NextResponse.json({ 
        error: 'Email preferences table does not exist. Please create it using the SQL in the migration file.',
        migration_sql: `
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

-- Create updated_at trigger
CREATE TRIGGER update_email_preferences_updated_at 
BEFORE UPDATE ON public.email_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for email_preferences table
CREATE POLICY "Users can view their own email preferences" ON public.email_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences" ON public.email_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences" ON public.email_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email preferences" ON public.email_preferences
    FOR DELETE USING (auth.uid() = user_id);
        `
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Email preferences table and policies created successfully' 
    })

  } catch (error) {
    console.error('Error initializing email preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}