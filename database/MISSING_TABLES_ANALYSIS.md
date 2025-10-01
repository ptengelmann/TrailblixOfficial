# Trailblix Database Analysis - Missing Tables & Columns

## Application Overview

**Trailblix** is an advanced AI-powered career development platform with the following key features:

### Core Features:
1. **Career Progress Tracking** - Track job applications, milestones, and weekly progress
2. **AI Intelligence Dashboard** - Real-time market intelligence and career predictions
3. **Resume Analysis** - AI-powered resume scoring and recommendations
4. **Job Search & Tracking** - Search jobs with AI matching and interaction tracking
5. **Networking Tracker** - Track professional networking activities
6. **Daily Tasks & Gamification** - Streak tracking, points, and daily goals
7. **Career Coach** - AI-powered career recommendations

---

## Database Status

### ✅ Tables That EXIST in Database (20 tables):
1. `user_profiles` - 5 rows
2. `career_objectives` - 5 rows
3. `user_resumes` - 0 rows
4. `resume_analyses` - 0 rows
5. `user_activities` - 6 rows
6. `progress_tracking` - 0 rows
7. `job_interactions` - 6 rows
8. `job_market_analytics` - 0 rows
9. `career_milestones` - 4 rows
10. `weekly_progress` - 3 rows
11. `daily_tasks` - 0 rows
12. `market_intelligence_cache` - 4 rows
13. `career_predictions` - 0 rows
14. `career_progression_patterns` - 4 rows (with seed data)
15. `skills_intelligence` - 6 rows (with seed data)
16. `salary_benchmarks` - 0 rows
17. `market_trends` - 0 rows
18. `career_intelligence_reports` - 27 rows
19. `market_intelligence_subscriptions` - 0 rows
20. `prediction_accuracy_tracking` - 0 rows

---

## ❌ MISSING Tables (Referenced in Code but NOT in Database):

### 1. `resumes` table
**Referenced in:**
- `src/pages/dashboard.tsx` (lines 110, 127)
- `src/pages/resume-analyzer.tsx` (lines 144, 178, 250, 256, 280)
- `src/pages/settings.tsx` (line 126)
- `src/pages/career-coach.tsx` (line 78)
- `src/pages/api/delete-account.ts` (lines 42, 54)
- `src/lib/prefetch.ts` (line 220) - references `user_resumes`

**Note:** Code uses both `resumes` and `user_resumes` - needs clarification!

**Columns needed:**
- `id` (primary key)
- `user_id` (UUID, references auth.users)
- `file_path` (text)
- `file_name` (text)
- `ai_analysis` (JSONB)
- `score` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

### 2. `career_recommendations` table
**Referenced in:**
- `src/pages/career-coach.tsx` (lines 79, 122)

**Columns needed:**
- `id` (primary key)
- `user_id` (UUID, references auth.users)
- `recommendation_data` (JSONB)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

### 3. `career_benchmarks` table
**Referenced in:**
- `src/pages/api/career-progress.ts` (line 469)

**Columns needed:**
- `id` (primary key)
- `career_stage` (text)
- `target_role` (text)
- `avg_applications_per_week` (numeric)
- `avg_response_rate` (numeric)
- `avg_interview_rate` (numeric)
- `created_at` (timestamp)

---

### 4. `job_search_sessions` table
**Referenced in:**
- `src/pages/api/jobs/search.ts` (line 415)

**Columns needed:**
- `id` (primary key)
- `user_id` (UUID, references auth.users)
- `search_query` (text)
- `filters` (JSONB)
- `results_count` (integer)
- `created_at` (timestamp)

---

## 🔧 Tables That Exist But May Need Columns Added:

### `user_activities` table
Currently exists, but verify it has these columns:
- `activity_type` (text)
- `activity_data` (JSONB)
- `points_earned` (integer) - for gamification

---

## 📊 Storage Buckets Needed:

### `resumes` storage bucket
Referenced in:
- `src/pages/resume-analyzer.tsx` (line 187) - for file storage
- `src/pages/api/delete-account.ts` (line 50) - for file deletion

---

## Summary of Changes Needed:

### Tables to Create: 4
1. ✅ `resumes` (or clarify `user_resumes` naming)
2. ✅ `career_recommendations`
3. ✅ `career_benchmarks`
4. ✅ `job_search_sessions`

### Storage Buckets to Create: 1
1. ✅ `resumes` bucket

### Tables to Verify/Update: 1
1. ✅ `user_activities` - verify gamification columns exist

---

## Next Steps:
1. Run the migration SQL script to create missing tables
2. Create the `resumes` storage bucket in Supabase dashboard
3. Set up Row Level Security (RLS) policies for new tables
4. Add seed data for `career_benchmarks` table
5. Test all API endpoints to verify database connectivity
