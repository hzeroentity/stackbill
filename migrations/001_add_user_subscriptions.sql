-- Migration: Add user_subscriptions table for payment plans
-- Run this in your Supabase SQL Editor

-- Create user_subscriptions table to track app subscription plans
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan_type VARCHAR(50) DEFAULT 'free' NOT NULL, -- 'free', 'pro'
    status VARCHAR(50) DEFAULT 'active' NOT NULL, -- 'active', 'canceled', 'past_due', 'incomplete'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Create unique index to ensure one subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id_unique ON user_subscriptions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can only see their own app subscription" ON user_subscriptions;
    DROP POLICY IF EXISTS "Users can insert their own app subscription" ON user_subscriptions;
    DROP POLICY IF EXISTS "Users can update their own app subscription" ON user_subscriptions;
    
    -- Create new policies
    CREATE POLICY "Users can only see their own app subscription" ON user_subscriptions
        FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own app subscription" ON user_subscriptions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own app subscription" ON user_subscriptions
        FOR UPDATE USING (auth.uid() = user_id);
END $$;

-- Create trigger to automatically update updated_at for user_subscriptions
-- (Note: This assumes the update_updated_at_column function already exists)
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();