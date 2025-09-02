-- Get the actual constraint names so we can drop them properly
SELECT 
    conname AS constraint_name,
    CASE 
        WHEN pg_get_constraintdef(oid) LIKE '%Analytics & Monitoring%' THEN 'NEW'
        WHEN pg_get_constraintdef(oid) LIKE '%Analytics & Tracking%' THEN 'OLD'
        ELSE 'OTHER'
    END AS constraint_type
FROM pg_constraint 
WHERE conrelid = 'public.subscriptions'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%category%'
ORDER BY constraint_type;