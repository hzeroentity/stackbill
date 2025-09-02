-- Find all existing categories in the database
SELECT category, COUNT(*) as count
FROM public.subscriptions 
GROUP BY category 
ORDER BY category;

-- Show the exact rows that would violate the new constraint
SELECT id, name, category, created_at
FROM public.subscriptions
WHERE category NOT IN (
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
);