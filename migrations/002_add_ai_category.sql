-- Migration: Add AI & Machine Learning category to subscriptions table
-- Run this in your Supabase SQL Editor

-- Drop the existing check constraint if it exists
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_category;

-- Add the updated check constraint with the new AI & Machine Learning category
ALTER TABLE subscriptions ADD CONSTRAINT valid_category 
    CHECK (category IN (
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
    ));