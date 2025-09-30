# 🗄️ Database Setup Guide

## Quick Setup (2 minutes)

### Step 1: Access your Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Login to your account
3. Select your TrailBlix project

### Step 2: Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `database/schema.sql`
4. Click **"Run"** button
5. Wait for it to complete (should take ~30 seconds)

**Option B: Using Supabase CLI**

```bash
# If you have Supabase CLI installed
supabase db reset
psql "postgresql://[YOUR_DB_URL]" -f database/schema.sql
```

### Step 3: Verify Tables Were Created

In your Supabase dashboard, go to **Table Editor** and verify you see these new tables:

✅ **Core Advanced Intelligence Tables:**
- `market_intelligence_cache`
- `career_predictions`
- `career_progression_patterns`
- `market_trends`
- `skills_intelligence`
- `job_market_analytics`
- `salary_benchmarks`
- `career_intelligence_reports`
- `market_intelligence_subscriptions`
- `prediction_accuracy_tracking`

### Step 4: Check Your Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_claude_api_key
ADZUNA_APP_ID=your_adzuna_id (optional)
ADZUNA_APP_KEY=your_adzuna_key (optional)
```

## 🧪 Test the System

After setup, test the advanced APIs:

### Test Market Intelligence
```bash
curl -X POST http://localhost:3000/api/market-intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_type": "comprehensive",
    "target_role": "Software Engineer",
    "location": "San Francisco"
  }'
```

### Test Career Predictions
```bash
curl -X POST http://localhost:3000/api/career-predictions \
  -H "Content-Type: application/json" \
  -d '{
    "user_profile": {
      "current_role": "Software Engineer",
      "years_experience": 3,
      "skills": ["Python", "React"],
      "location": "New York"
    },
    "prediction_timeframe": "12m"
  }'
```

### Test Salary Intelligence
```bash
curl -X POST http://localhost:3000/api/salary-intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_type": "benchmark",
    "role_title": "Product Manager",
    "location": "London",
    "years_experience": 4
  }'
```

## 🎯 What This Enables

After running these migrations, TrailBlix will have:

✅ **Real-time market intelligence** processing
✅ **Advanced career predictions** with ML
✅ **Comprehensive salary benchmarking**
✅ **Skills intelligence** with demand forecasting
✅ **Historical pattern tracking** for accuracy
✅ **User intelligence reports** with caching

## 🚀 Advanced Dashboard

Visit `/intelligence-dashboard` to see the advanced AI dashboard in action!

---

**Total setup time: ~2 minutes**
**Result: Production-ready AI career intelligence platform** 🎉