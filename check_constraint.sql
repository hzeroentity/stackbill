-- Check current constraint definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.subscriptions'::regclass 
AND conname = 'subscriptions_category_check';