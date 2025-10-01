# Quick Start: Subscription System Setup

## ⚡ 5-Minute Setup

### Step 1: Apply Database Schema (2 minutes)

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste the contents of `database/subscription-schema.sql` and run it.

Then create the trigger for new user signups:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();
```

### Step 2: Backfill Existing Users (30 seconds)

```sql
-- Give all existing users a Free plan
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;
```

### Step 3: Verify Setup (30 seconds)

```sql
-- Check plans exist
SELECT * FROM subscription_plans;

-- Check users have subscriptions
SELECT COUNT(*) FROM user_subscriptions;
```

---

## ✅ What's Protected

### AI Endpoints (5 insights/month for Free, unlimited for Pro)
- ✅ `/api/market-intelligence` - Market analysis
- ✅ `/api/salary-intelligence` - Salary forecasting
- ✅ `/api/intelligence/comprehensive-analysis` - Full AI analysis
- ✅ `/api/dashboard/unified-intelligence` - Dashboard intelligence

### Pro-Only Features
- ✅ `/api/career-predictions` - Advanced career predictions
- Future: Skills gap analysis, career path mapping, etc.

### Rate Limits
- AI Endpoints: 20 requests/minute
- Pro Features: 30 requests/minute
- All APIs: Authentication required

---

## 🧪 Testing the System

### Test Free Plan Limits

1. Sign up a new user
2. Make 5 API calls to any AI endpoint (e.g., `/api/market-intelligence`)
3. 6th call should return:

```json
{
  "success": false,
  "error": "Usage limit exceeded",
  "message": "You've reached your monthly limit of 5 ai_insights_per_month. Upgrade to Pro for unlimited access.",
  "code": "USAGE_LIMIT_EXCEEDED",
  "usage": { "current": 5, "limit": 5 },
  "upgradeUrl": "/pricing",
  "currentPlan": "free"
}
```

### Test Pro Upgrade

```typescript
// In your app (logged in user)
const { upgrade } = useSubscription()
await upgrade('monthly') // Starts 14-day trial

// Now make 100+ AI calls - all should work!
```

### Test Rate Limiting

```bash
# Make 21 requests in 1 minute
for i in {1..21}; do
  curl -H "Authorization: Bearer $TOKEN" \
    https://yourapp.com/api/market-intelligence \
    -d '{"analysis_type":"role","target_role":"Software Engineer"}'
done

# 21st request returns 429 Rate Limit Exceeded
```

---

## 📊 Monitor Usage

### Check current usage

```sql
SELECT
  u.email,
  us.plan_id,
  uu.resource_type,
  uu.usage_count,
  uu.period_start
FROM user_usage uu
JOIN auth.users u ON uu.user_id = u.id
JOIN user_subscriptions us ON u.id = us.user_id
WHERE uu.period_start >= date_trunc('month', NOW())
ORDER BY uu.usage_count DESC;
```

### Check subscriptions by plan

```sql
SELECT plan_id, status, COUNT(*) as count
FROM user_subscriptions
GROUP BY plan_id, status;
```

---

## 🎨 Frontend Usage

### Check if user has access

```typescript
import { useFeatureAccess } from '@/contexts/SubscriptionContext'
import UpgradePrompt from '@/components/subscription/UpgradePrompt'

function CareerPredictions() {
  const { hasAccess } = useFeatureAccess('career_predictions')

  if (!hasAccess) {
    return <UpgradePrompt feature="career_predictions" compact />
  }

  return <YourComponent />
}
```

### Display usage stats

```typescript
import { useSubscription } from '@/contexts/SubscriptionContext'

function UsageStats() {
  const { usage, plan } = useSubscription()

  return (
    <div>
      <h3>{plan?.name} Plan</h3>
      <p>AI Insights: {usage?.ai_insights.current} / {usage?.ai_insights.limit}</p>
      <progress value={usage?.ai_insights.percentage} max="100" />
    </div>
  )
}
```

---

## 🔐 Security Notes

- ✅ All subscription data protected by Row-Level Security (RLS)
- ✅ Users can only see their own subscriptions
- ✅ API endpoints require Bearer token authentication
- ✅ Rate limiting prevents abuse
- ✅ All subscription changes are audit-logged

---

## 🎯 Next Steps

1. **Run the database setup** (see Step 1 above)
2. **Test with a real user** - Sign up and hit the limits
3. **Customize rate limits** if needed (in middleware)
4. **Add Stripe integration** for real payments (future)
5. **Set up email notifications** for usage warnings (future)

---

## 📞 Troubleshooting

**Error: "Unauthorized"**
- Check the `Authorization: Bearer <token>` header is present
- Verify token is valid: `await supabase.auth.getUser(token)`

**Error: "Usage limit exceeded" immediately**
- Check `user_usage` table: `SELECT * FROM user_usage WHERE user_id = 'xxx'`
- Reset usage: `DELETE FROM user_usage WHERE user_id = 'xxx'`

**Subscription not found**
- Run backfill query (Step 2 above)
- Check trigger is created on `auth.users`

---

## 🚀 You're Ready!

The subscription system is fully functional. Every AI endpoint now:
- ✅ Requires authentication
- ✅ Tracks usage (Free: 5/month, Pro: unlimited)
- ✅ Enforces rate limits
- ✅ Returns helpful upgrade prompts
- ✅ Logs everything for analytics

Start testing and enjoy your enterprise-grade freemium platform! 🎉
