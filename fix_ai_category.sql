-- Update database constraint with improved category names and new categories

-- Drop the existing constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_category_check;

-- Add the updated constraint with all new categories
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