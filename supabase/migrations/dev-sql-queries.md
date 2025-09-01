# Development SQL Queries for Plan Management

## 🚨 DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION

These SQL queries are for development testing only. They bypass the Stripe payment system and directly manipulate the database.

## Prerequisites

Before using these queries, you need to know the user's `user_id`. You can find it in the `auth.users` table or from the application.

```sql
-- Find user ID by email
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

## 1. Activate Pro Plan for User

This is the main query you need. Replace `YOUR_USER_ID_HERE` with the actual user ID.

```sql
INSERT INTO user_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    canceled_at,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID_HERE',
    'dev_customer_' || substr(md5(random()::text), 1, 8),
    'dev_sub_' || substr(md5(random()::text), 1, 8),
    'pro',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month',
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    plan_type = 'pro',
    status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month',
    canceled_at = NULL,
    updated_at = NOW(),
    stripe_customer_id = COALESCE(user_subscriptions.stripe_customer_id, 'dev_customer_' || substr(md5(random()::text), 1, 8)),
    stripe_subscription_id = COALESCE(user_subscriptions.stripe_subscription_id, 'dev_sub_' || substr(md5(random()::text), 1, 8));
```

## 2. Revert to Free Plan

```sql
UPDATE user_subscriptions 
SET 
    plan_type = 'free',
    status = 'active',
    current_period_start = NULL,
    current_period_end = NULL,
    canceled_at = NOW(),
    updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID_HERE';
```

## 3. Delete User Subscription (Complete Reset)

```sql
DELETE FROM user_subscriptions WHERE user_id = 'YOUR_USER_ID_HERE';
```

## 4. Check Current User Plan

```sql
SELECT 
    us.plan_type,
    us.status,
    us.current_period_start,
    us.current_period_end,
    us.canceled_at,
    au.email
FROM user_subscriptions us
JOIN auth.users au ON us.user_id = au.id
WHERE us.user_id = 'YOUR_USER_ID_HERE';
```

## 5. Batch Operations - Multiple Users

### Activate Pro for multiple users by email
```sql
WITH user_emails AS (
    SELECT id FROM auth.users 
    WHERE email IN ('user1@example.com', 'user2@example.com', 'user3@example.com')
)
INSERT INTO user_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    canceled_at,
    created_at,
    updated_at
)
SELECT 
    id,
    'dev_customer_' || substr(md5(random()::text), 1, 8),
    'dev_sub_' || substr(md5(random()::text), 1, 8),
    'pro',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month',
    NULL,
    NOW(),
    NOW()
FROM user_emails
ON CONFLICT (user_id) 
DO UPDATE SET
    plan_type = 'pro',
    status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month',
    canceled_at = NULL,
    updated_at = NOW();
```

## 6. Advanced: Create Pro Plan with Custom Duration

```sql
-- Pro plan valid for 1 year
INSERT INTO user_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    canceled_at,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID_HERE',
    'dev_customer_' || substr(md5(random()::text), 1, 8),
    'dev_sub_' || substr(md5(random()::text), 1, 8),
    'pro',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',  -- Changed to 1 year
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    plan_type = 'pro',
    status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 year',  -- Changed to 1 year
    canceled_at = NULL,
    updated_at = NOW();
```

## 7. Quick Test Scenarios

### Scenario A: Fresh Pro User
```sql
-- 1. Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 2. Copy the ID and activate Pro
INSERT INTO user_subscriptions (user_id, plan_type, status, current_period_start, current_period_end, created_at, updated_at) 
VALUES ('YOUR_USER_ID_HERE', 'pro', 'active', NOW(), NOW() + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET plan_type = 'pro', status = 'active', updated_at = NOW();
```

### Scenario B: Switch Between Plans
```sql
-- Switch to Pro
UPDATE user_subscriptions SET plan_type = 'pro', status = 'active', updated_at = NOW() WHERE user_id = 'YOUR_USER_ID_HERE';

-- Switch to Free
UPDATE user_subscriptions SET plan_type = 'free', status = 'active', updated_at = NOW() WHERE user_id = 'YOUR_USER_ID_HERE';
```

## Usage Instructions

1. Open Supabase Dashboard → SQL Editor
2. Replace `YOUR_USER_ID_HERE` with your actual user ID
3. Run the query
4. Refresh your application to see the changes
5. Check the dashboard to confirm Pro features are enabled

## Notes

- All queries use `ON CONFLICT` to handle existing subscriptions
- Fake Stripe IDs are generated for development consistency
- Changes take effect immediately in the application
- Remember to test both Pro → Free and Free → Pro transitions
- The application checks the `plan_type` field to determine features