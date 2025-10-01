# Development Guide: Testing Subscription System

## 🎯 Quick Commands

### Upgrade Your Account to Pro

```bash
node scripts/dev-upgrade-to-pro.js cara.robinson0903@gmail.com
```

This will:
- ✅ Set your account to Pro plan
- ✅ Give you unlimited AI insights
- ✅ Unlock all Pro features
- ✅ Set expiry to 1 year from now
- ✅ No payment required (dev mode)

### Check Your Subscription Status

```bash
node scripts/dev-check-subscription.js cara.robinson0903@gmail.com
```

This shows:
- Current plan (Free/Pro)
- Subscription status
- Usage stats for this month
- Feature limits

### Reset Usage Counters

```bash
node scripts/dev-reset-usage.js cara.robinson0903@gmail.com
```

This will:
- Reset all usage counters to 0
- Let you test limits from scratch
- Useful when testing Free plan limits

---

## 🧪 Testing Scenarios

### Scenario 1: Test Free Plan Limits

1. **Downgrade to Free** (run in Supabase SQL editor):
```sql
UPDATE user_subscriptions
SET plan_id = 'free', status = 'active'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cara.robinson0903@gmail.com');
```

2. **Reset usage**:
```bash
node scripts/dev-reset-usage.js cara.robinson0903@gmail.com
```

3. **Make 5 AI calls** - Should work fine

4. **Make 6th AI call** - Should get:
```json
{
  "success": false,
  "error": "Usage limit exceeded",
  "message": "You've reached your monthly limit...",
  "code": "USAGE_LIMIT_EXCEEDED",
  "upgradeUrl": "/pricing"
}
```

### Scenario 2: Test Pro Unlimited Access

1. **Upgrade to Pro**:
```bash
node scripts/dev-upgrade-to-pro.js cara.robinson0903@gmail.com
```

2. **Make 100+ AI calls** - All should work!

3. **Check usage**:
```bash
node scripts/dev-check-subscription.js cara.robinson0903@gmail.com
```

### Scenario 3: Test Pro-Only Features

1. **Upgrade to Pro** (if not already)

2. **Test Career Predictions**:
```bash
curl -X POST http://localhost:3000/api/career-predictions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_profile": {
      "current_role": "Software Engineer",
      "years_experience": 3,
      "skills": ["React", "Node.js"],
      "industry": "Technology"
    },
    "prediction_timeframe": "18m"
  }'
```

3. **Downgrade to Free and try again** - Should get:
```json
{
  "success": false,
  "error": "Feature not available",
  "code": "FEATURE_LOCKED",
  "upgradeUrl": "/pricing"
}
```

### Scenario 4: Test Rate Limiting

Run this to hit rate limits:
```bash
# Make 25 requests quickly (limit is 20/min)
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/market-intelligence \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"analysis_type":"role","target_role":"Engineer"}' &
done
```

After 20 requests, you should get:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 🔧 Manual Database Operations

### Upgrade Any User to Pro

```sql
INSERT INTO user_subscriptions (user_id, plan_id, status, billing_period, current_period_start, current_period_end)
SELECT
  id,
  'pro',
  'active',
  'monthly',
  NOW(),
  NOW() + INTERVAL '1 year'
FROM auth.users
WHERE email = 'cara.robinson0903@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET
  plan_id = 'pro',
  status = 'active',
  billing_period = 'monthly',
  current_period_end = NOW() + INTERVAL '1 year';
```

### Check All Users and Their Plans

```sql
SELECT
  u.email,
  us.plan_id,
  us.status,
  us.current_period_end
FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
ORDER BY u.created_at DESC;
```

### View Usage for All Users

```sql
SELECT
  u.email,
  uu.resource_type,
  uu.usage_count,
  us.plan_id
FROM user_usage uu
JOIN auth.users u ON uu.user_id = u.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE uu.period_start >= date_trunc('month', NOW())
ORDER BY uu.usage_count DESC;
```

### Reset Usage for All Users

```sql
DELETE FROM user_usage
WHERE period_start >= date_trunc('month', NOW());
```

### Create a Pro Trial (14 days)

```sql
UPDATE user_subscriptions
SET
  plan_id = 'pro',
  status = 'trialing',
  trial_start = NOW(),
  trial_end = NOW() + INTERVAL '14 days'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cara.robinson0903@gmail.com');
```

---

## 🎨 Frontend Testing

### Test Upgrade Prompt Component

```typescript
// Add to any dashboard page temporarily
import UpgradePrompt from '@/components/subscription/UpgradePrompt'

// Compact version
<UpgradePrompt compact feature="career_predictions" />

// Full version
<UpgradePrompt
  title="Unlock Advanced Features"
  description="Get unlimited AI insights and more"
/>
```

### Test Feature Gate

```typescript
import { useFeatureAccess } from '@/contexts/SubscriptionContext'

function TestComponent() {
  const { hasAccess, upgradeRequired } = useFeatureAccess('career_predictions')

  if (!hasAccess) {
    return <UpgradePrompt feature="career_predictions" />
  }

  return <div>Pro feature content here</div>
}
```

### Test Subscription Hook

```typescript
import { useSubscription } from '@/contexts/SubscriptionContext'

function SubscriptionDebug() {
  const { subscription, plan, usage, isPro, isTrial } = useSubscription()

  return (
    <div>
      <h3>Current Plan: {plan?.name}</h3>
      <p>Is Pro: {isPro ? 'Yes' : 'No'}</p>
      <p>Is Trial: {isTrial ? 'Yes' : 'No'}</p>
      <p>AI Insights: {usage?.ai_insights.current} / {usage?.ai_insights.limit}</p>
    </div>
  )
}
```

---

## 🐛 Troubleshooting

### "User not found"
Make sure the email is correct and the user exists:
```sql
SELECT id, email FROM auth.users WHERE email LIKE '%cara%';
```

### "No subscription found"
Run the backfill script:
```sql
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions);
```

### Usage not tracking
Check if usage is being recorded:
```sql
SELECT * FROM user_usage
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cara.robinson0903@gmail.com')
ORDER BY created_at DESC;
```

### Rate limits not working
Check rate limit table:
```sql
SELECT * FROM api_rate_limits
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cara.robinson0903@gmail.com')
AND window_start >= NOW() - INTERVAL '5 minutes';
```

---

## 📝 Tips

1. **Keep your dev account on Pro** for testing features quickly
2. **Create a separate test account** to test Free plan limits
3. **Reset usage regularly** when testing limit behavior
4. **Check Supabase logs** in Dashboard → Logs for API errors
5. **Use the check script** before testing to verify your plan

---

## 🚀 Your Dev Account Setup

Run this to set up your account:

```bash
# 1. Upgrade to Pro (unlimited access)
node scripts/dev-upgrade-to-pro.js cara.robinson0903@gmail.com

# 2. Verify it worked
node scripts/dev-check-subscription.js cara.robinson0903@gmail.com
```

Now you can:
- ✅ Test all Pro features
- ✅ Make unlimited AI calls
- ✅ Access career predictions
- ✅ No usage limits
- ✅ No payment required

Happy testing! 🎉
