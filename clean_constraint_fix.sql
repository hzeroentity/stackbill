-- Clean fix: Remove both conflicting constraints and create one proper constraint

-- Drop both the old and new conflicting constraints
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_category_check;

-- Create one clean, correct constraint
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_category_check 
CHECK (category IN (
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
));