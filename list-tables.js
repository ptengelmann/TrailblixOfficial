const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mgowzazfimzeqgghfznz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nb3d6YXpmaW16ZXFnZ2hmem56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM5MDA3MywiZXhwIjoyMDczOTY2MDczfQ.ZcYlKcehZWyHqg-VKvbb2ZPDW2IQIxIyXe1NiCKtuRM'
);

async function listTables() {
  const knownTables = [
    'user_profiles',
    'career_objectives',
    'resumes',
    'user_resumes',
    'resume_analyses',
    'user_activities',
    'progress_tracking',
    'job_interactions',
    'job_market_analytics',
    'career_milestones',
    'weekly_progress',
    'daily_tasks',
    'market_intelligence_cache',
    'career_predictions',
    'career_progression_patterns',
    'skills_intelligence',
    'salary_benchmarks',
    'market_trends',
    'career_intelligence_reports',
    'market_intelligence_subscriptions',
    'prediction_accuracy_tracking',
    'career_recommendations',
    'career_benchmarks',
    'job_search_sessions'
  ];

  console.log('Tables in your database:\n');

  for (const table of knownTables) {
    const { error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`  ✓ ${table}`);
    }
  }
}

listTables();
