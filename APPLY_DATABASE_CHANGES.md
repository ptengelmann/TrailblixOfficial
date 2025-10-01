# How to Apply Database Changes to Supabase

## Summary of Your Application

**Trailblix** is an AI-powered career development platform with:
- Career progress tracking with milestones and weekly goals
- AI intelligence dashboard with market analysis and career predictions
- Resume analysis with AI scoring
- Job search with tracking and AI matching
- Networking tracker
- Daily tasks with gamification (streaks, points, levels)
- AI career coach with recommendations

---

## What's Missing in Your Database

After analyzing your code, I found **3 tables** that your application references but don't exist in your Supabase database:

### Missing Tables:
1. ✅ `career_recommendations` - For AI career coach recommendations
2. ✅ `career_benchmarks` - For comparing user progress to industry benchmarks
3. ✅ `job_search_sessions` - For caching job search results

### Already Exists:
- ✅ `resumes` table (you confirmed this exists)

---

## Step-by-Step Guide to Apply Changes

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `mgowzazfimzeqgghfznz`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration Script**
   - Open the file: `database/migrations/002-add-missing-tables.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Cmd + Enter` (Mac) / `Ctrl + Enter` (Windows)
   - Wait for confirmation message
   - You should see: "Success. No rows returned"

5. **Verify the Tables Were Created**
   - Run this verification query:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('career_recommendations', 'career_benchmarks', 'job_search_sessions');
   ```
   - You should see all 3 tables listed

6. **Verify Benchmark Data Was Inserted**
   ```sql
   SELECT COUNT(*) as benchmark_count FROM career_benchmarks;
   ```
   - You should see ~18 rows (benchmark data for different roles)

---

### Option 2: Using psql Command Line (Alternative)

If you prefer command line:

```bash
psql "postgresql://postgres:Tigrebranco123@db.mgowzazfimzeqgghfznz.supabase.co:5432/postgres" < database/migrations/002-add-missing-tables.sql
```

**Note:** You'll need PostgreSQL client installed. On Mac: `brew install postgresql`

---

## Additional Setup Required

### Storage Bucket (If Not Already Created)

Your application uploads resumes to a storage bucket. Verify it exists:

1. **Check if `resumes` bucket exists:**
   - In Supabase Dashboard → Storage
   - Look for a bucket called "resumes"

2. **If it doesn't exist, create it:**
   - Click "New Bucket"
   - Name: `resumes`
   - Public: **No** (keep private)
   - File size limit: 10 MB
   - Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. **Set up Storage Policies:**
   ```sql
   -- Allow authenticated users to upload their own resumes
   CREATE POLICY "Users can upload their own resumes"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

   -- Allow users to read their own resumes
   CREATE POLICY "Users can read their own resumes"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

   -- Allow users to delete their own resumes
   CREATE POLICY "Users can delete their own resumes"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

---

## What These Tables Do

### 1. `career_recommendations`
- **Purpose:** Stores AI-generated career advice and recommendations
- **Used in:** Career Coach page (`/career-coach`)
- **Example data:**
  - Job application strategies
  - Networking tips
  - Skill development recommendations
  - Interview preparation advice

### 2. `career_benchmarks`
- **Purpose:** Industry benchmark data to compare user's job search performance
- **Used in:** Dashboard progress tracking (`/api/career-progress`)
- **Contains:** Average applications per week, response rates, salary ranges by role and experience level
- **Seed data included:** 18 different role benchmarks (Software Engineer, Product Manager, Data Scientist, etc.)

### 3. `job_search_sessions`
- **Purpose:** Caches job search results to improve performance
- **Used in:** Job search page (`/jobs`)
- **Auto-expires:** Results cached for 24 hours
- **Benefits:** Faster search results, reduced API calls

---

## Testing After Migration

Run these tests to make sure everything works:

### 1. Test Database Connection
```bash
node check-db.js
```

### 2. Test Application Pages
1. Start your dev server: `npm run dev`
2. Visit these pages and check for errors:
   - `/dashboard` - Should load without errors
   - `/career-coach` - Should be able to get recommendations
   - `/jobs` - Job search should work
   - `/intelligence-dashboard` - AI insights should load

### 3. Check Browser Console
- Open DevTools (F12)
- Look for any database errors
- All API calls should succeed (200 status)

---

## Troubleshooting

### Error: "relation does not exist"
- **Solution:** Table wasn't created. Re-run the migration script.

### Error: "permission denied"
- **Solution:** RLS policy issue. Check that you're logged in and user auth is working.

### Error: "duplicate key value violates unique constraint"
- **Solution:** Migration was already run. This is safe to ignore.

### Can't connect to database
- **Solution:** Check your internet connection and verify Supabase project is active.

---

## Need Help?

If you encounter any issues:
1. Check the browser console for specific error messages
2. Check Supabase logs in Dashboard → Logs
3. Run the verification queries above to confirm tables exist
4. Make sure your `.env.local` has correct Supabase credentials

---

## Summary of Changes

✅ **3 new tables** created:
- `career_recommendations`
- `career_benchmarks`
- `job_search_sessions`

✅ **18 benchmark records** inserted for different roles

✅ **RLS policies** configured for security

✅ **Indexes** added for performance

✅ **Cleanup function** created for expired search sessions

Your application should now have everything it needs to run properly! 🚀
