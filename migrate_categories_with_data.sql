-- Migrate existing category data and update constraint

-- First, update existing data to new category names
UPDATE public.subscriptions 
SET category = 'Analytics & Monitoring' 
WHERE category = 'Analytics & Tracking';

UPDATE public.subscriptions 
SET category = 'AI Tools & LLMs' 
WHERE category = 'AI & Machine Learning';

UPDATE public.subscriptions 
SET category = 'Media & Content' 
WHERE category = 'Entertainment';

-- Now drop the existing constraint
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