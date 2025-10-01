-- MANUAL SETUP INSTRUCTIONS
-- Copy this entire file and run it in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run

-- Step 1: Run the subscription schema
\i database/subscription-schema.sql

-- Step 2: Create the trigger for new users
-- This ensures all new signups automatically get a Free subscription
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Step 3: Backfill existing users (if any)
-- This gives existing users without subscriptions a Free plan
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Verify setup
SELECT 'Subscription plans:', COUNT(*) FROM subscription_plans;
SELECT 'User subscriptions:', COUNT(*) FROM user_subscriptions;
SELECT 'Triggers created successfully!' as status;

-- Step 5: Test the functions
-- Replace 'YOUR_USER_ID' with an actual user ID
-- SELECT * FROM get_user_subscription('YOUR_USER_ID'::uuid);
-- SELECT check_usage_limit('YOUR_USER_ID'::uuid, 'ai_insights_per_month');
