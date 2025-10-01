# TrailBlix Subscription System Documentation

## Overview

TrailBlix implements an enterprise-grade freemium subscription system with:
- ✅ Free and Pro plans
- ✅ Feature gating based on subscription tier
- ✅ Rate limiting per endpoint
- ✅ Usage tracking and limits
- ✅ Automatic trial management (14-day free trial for Pro)
- ✅ Row-level security (RLS) on all subscription data
- ✅ Comprehensive API middleware
- ✅ React context for frontend integration

---

## Architecture

### Database Layer (`database/subscription-schema.sql`)

**Tables:**
1. `subscription_plans` - Available plans (Free, Pro) with features and limits
2. `user_subscriptions` - User subscription status and billing info
3. `user_usage` - Monthly usage tracking for rate-limited features
4. `api_rate_limits` - API rate limiting per endpoint
5. `subscription_events` - Audit log of subscription changes

**Functions:**
- `get_user_subscription()` - Get user's plan with limits
- `check_usage_limit()` - Check if user exceeded monthly limit
- `increment_usage()` - Increment usage counter
- `check_rate_limit()` - Check and enforce API rate limits

### Backend Layer

#### Subscription Library (`src/lib/subscription.ts`)

Core subscription management utilities:

```typescript
import { getUserSubscription, hasFeatureAccess, checkUsageLimit } from '@/lib/subscription'

// Get user's subscription
const subscription = await getUserSubscription(userId)

// Check feature access
const hasAccess = hasFeatureAccess(subscription, 'career_predictions')

// Check usage limits
const { exceeded, current, limit } = await checkUsageLimit(userId, 'ai_insights_per_month')
```

#### Middleware (`src/middleware/subscription.ts`)

Protect API routes with subscription checks:

```typescript
import { withAIAccess, withProAccess, withAuth } from '@/middleware/subscription'

// For AI-powered endpoints (with usage tracking)
export default withAIAccess(async (req, res) => {
  // req.user is automatically populated
  // Usage is automatically incremented
  // Rate limiting is enforced
})

// For Pro-only features
export default withProAccess(async (req, res) => {
  // Only Pro users can access
}, 'career_predictions')

// For simple authentication
export default withAuth(async (req, res) => {
  // Just auth, no subscription checks
})
```

#### API Endpoints

**`/api/subscription`**
- `GET` - Get subscription details and usage stats
- `POST { action: 'upgrade' }` - Upgrade to Pro (starts 14-day trial)
- `POST { action: 'cancel' }` - Cancel subscription

### Frontend Layer

#### Subscription Context (`src/contexts/SubscriptionContext.tsx`)

Provides subscription state throughout the app:

```typescript
import { useSubscription, useFeatureAccess } from '@/contexts/SubscriptionContext'

function MyComponent() {
  const { subscription, plan, usage, isPro, isTrial, upgrade, cancel } = useSubscription()

  // Check feature access
  const { hasAccess, upgradeRequired } = useFeatureAccess('career_predictions')

  if (!hasAccess) {
    return <UpgradePrompt feature="career_predictions" />
  }

  // Component logic...
}
```

#### Upgrade Prompt Component (`src/components/subscription/UpgradePrompt.tsx`)

Shows when users hit limits or access Pro features:

```typescript
import UpgradePrompt from '@/components/subscription/UpgradePrompt'

// Compact version (for inline use)
<UpgradePrompt compact feature="daily_tasks" />

// Full version (for modals/dedicated pages)
<UpgradePrompt
  title="Unlock Daily Tasks"
  description="Get personalized daily tasks with a Pro subscription"
/>
```

---

## Plan Features & Limits

### Free Plan ($0/month)
- ✅ Basic job search & browsing
- ✅ 5 AI insights per month
- ✅ Basic salary data
- ✅ Simple career tracking
- ✅ Community support
- ❌ Career predictions
- ❌ Skills gap analysis
- ❌ Daily personalized tasks
- ❌ Full networking tracker
- ❌ 18-month salary forecasting

### Pro Plan ($15/month or $144/year)
- ✅ **Everything in Free, plus:**
- ✅ Unlimited AI insights
- ✅ Advanced career predictions (94% accuracy)
- ✅ Comprehensive skills gap analysis
- ✅ Daily personalized tasks
- ✅ Full networking tracker
- ✅ Gamification (XP, streaks, levels)
- ✅ 18-month salary forecasting
- ✅ Career path mapping
- ✅ Job market trend analysis
- ✅ Priority support
- ✅ Early access to new features
- ✅ **14-day free trial**

---

## Implementation Guide

### Step 1: Database Setup

Run the subscription schema:

```sql
-- Execute database/subscription-schema.sql in your Supabase SQL editor
psql < database/subscription-schema.sql
```

**Important:** Create the trigger on `auth.users` in Supabase dashboard:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();
```

### Step 2: Add Subscription Provider

Wrap your app with the `SubscriptionProvider`:

```typescript
// pages/_app.tsx
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Component {...pageProps} />
      </SubscriptionProvider>
    </AuthProvider>
  )
}
```

### Step 3: Protect API Routes

Update existing API routes to use subscription middleware:

**Before:**
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Manual auth checking
  const authHeader = req.headers.authorization
  // ...
}
```

**After:**
```typescript
import { withAIAccess } from '@/middleware/subscription'

export default withAIAccess(async (req, res) => {
  // req.user is already authenticated
  // Usage is automatically tracked
  // Rate limits are enforced
  // Feature access is verified
})
```

### Step 4: Add Feature Gates in Frontend

```typescript
import { useFeatureAccess } from '@/contexts/SubscriptionContext'
import UpgradePrompt from '@/components/subscription/UpgradePrompt'

function CareerPredictions() {
  const { hasAccess } = useFeatureAccess('career_predictions')

  if (!hasAccess) {
    return <UpgradePrompt feature="career_predictions" compact />
  }

  return (
    // Component logic
  )
}
```

### Step 5: Display Usage Stats

```typescript
import { useSubscription } from '@/contexts/SubscriptionContext'

function UsageDisplay() {
  const { usage, plan } = useSubscription()

  return (
    <div>
      <h3>{plan?.name} Plan</h3>
      <div>
        AI Insights: {usage?.ai_insights.current} / {usage?.ai_insights.limit}
      </div>
    </div>
  )
}
```

---

## Rate Limits

### Default Rate Limits
- AI Endpoints: 20 requests/minute
- Pro Features: 30 requests/minute
- General APIs: 100 requests/minute

### Customize Rate Limits

```typescript
export default withSubscription(handler, {
  rateLimitMax: 50,
  rateLimitWindow: 60 // seconds
})
```

---

## Testing

### Test Free Plan Limits

1. Create a new user account
2. Use AI insights 5 times
3. 6th attempt should return 429 with upgrade prompt

```json
{
  "success": false,
  "error": "Usage limit exceeded",
  "message": "You've reached your monthly limit of 5 ai_insights_per_month. Upgrade to Pro for unlimited access.",
  "code": "USAGE_LIMIT_EXCEEDED",
  "usage": { "current": 5, "limit": 5 },
  "upgradeUrl": "/pricing"
}
```

### Test Pro Access

```typescript
// Upgrade a user to Pro
const { upgrade } = useSubscription()
await upgrade('monthly') // Starts 14-day trial

// Verify unlimited access
const { exceeded } = await checkUsageLimit(userId, 'ai_insights_per_month')
// exceeded should be false even after 100+ requests
```

### Test Rate Limiting

```bash
# Make 21 requests in 1 minute to an AI endpoint
for i in {1..21}; do
  curl -H "Authorization: Bearer $TOKEN" https://yourapp.com/api/intelligence/comprehensive-analysis
done

# 21st request should return 429
```

---

## Security Features

1. **Row Level Security (RLS)** - Users can only see their own subscription data
2. **Bearer Token Authentication** - All API routes require valid JWT
3. **Rate Limiting** - Prevents abuse and DDoS
4. **Usage Tracking** - Enforces plan limits
5. **Audit Logging** - All subscription changes are logged

---

## Error Handling

### Common Error Codes

- `FEATURE_LOCKED` - Feature requires Pro subscription
- `USAGE_LIMIT_EXCEEDED` - Monthly usage limit reached
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `UNAUTHORIZED` - Missing/invalid authentication

### Error Response Format

```json
{
  "success": false,
  "error": "Feature not available",
  "message": "This feature requires a Pro subscription. Upgrade to unlock career predictions.",
  "code": "FEATURE_LOCKED",
  "upgradeUrl": "/pricing",
  "currentPlan": "free"
}
```

---

## Monitoring & Analytics

### Track Subscription Metrics

```sql
-- Active subscriptions by plan
SELECT plan_id, COUNT(*) FROM user_subscriptions
WHERE status = 'active'
GROUP BY plan_id;

-- Trial conversion rate
SELECT
  COUNT(CASE WHEN status = 'active' AND trial_end IS NOT NULL AND trial_end < NOW() THEN 1 END) as converted,
  COUNT(CASE WHEN trial_end IS NOT NULL THEN 1 END) as total_trials
FROM user_subscriptions;

-- Usage patterns
SELECT resource_type, AVG(usage_count) as avg_usage
FROM user_usage
WHERE period_start >= date_trunc('month', NOW())
GROUP BY resource_type;
```

---

## Roadmap

### Implemented ✅
- [x] Database schema
- [x] Backend API
- [x] Middleware
- [x] React context
- [x] Upgrade UI
- [x] Rate limiting
- [x] Usage tracking

### Todo 📋
- [ ] Stripe integration for payments
- [ ] Email notifications (usage warnings, trial ending)
- [ ] Admin dashboard for subscription management
- [] Webhook handlers for Stripe events
- [ ] Analytics dashboard
- [ ] A/B testing for pricing

---

## Support

For questions or issues:
- Check this documentation first
- Review code examples in `src/middleware/subscription.ts`
- See implementation examples in `src/contexts/SubscriptionContext.tsx`

---

## Quick Reference

### Feature Keys
- `ai_insights_per_month` - Monthly AI insights limit
- `career_predictions` - Advanced predictions
- `skills_gap_analysis` - Skills analysis
- `networking_tracker` - Network tracking
- `daily_tasks` - Daily personalized tasks
- `salary_forecasting` - 18-month forecasting
- `career_path_mapping` - Career paths
- `job_market_trends` - Market analysis
- `priority_support` - Priority email support
