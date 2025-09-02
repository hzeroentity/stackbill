-- Complete category migration fix

-- Step 1: Remove the constraint completely first
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_category_check;

-- Step 2: Update all existing data to new category names
UPDATE public.subscriptions 
SET category = 'Analytics & Monitoring' 
WHERE category = 'Analytics & Tracking';

UPDATE public.subscriptions 
SET category = 'AI Tools & LLMs' 
WHERE category = 'AI & Machine Learning';

UPDATE public.subscriptions 
SET category = 'Media & Content' 
WHERE category = 'Entertainment';

-- Step 3: Verify the updates worked
SELECT category, COUNT(*) as count
FROM public.subscriptions 
GROUP BY category 
ORDER BY category;

-- Step 4: Add the new constraint
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