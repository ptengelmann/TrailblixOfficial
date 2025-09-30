-- Database setup for new Daily Tasks and Gamification features
-- Run these commands in your Supabase SQL editor

-- 1. Ensure user_activities table has the right structure
-- This table is crucial for daily tasks, streaks, and activity feed

-- Check if user_activities exists and has the right columns
-- If it doesn't have activity_data column, add it:
ALTER TABLE user_activities
ADD COLUMN IF NOT EXISTS activity_data JSONB DEFAULT '{}';

-- Ensure the activity_type column can handle new values
-- Update the check constraint if it exists, or add one
ALTER TABLE user_activities
DROP CONSTRAINT IF EXISTS user_activities_activity_type_check;

ALTER TABLE user_activities
ADD CONSTRAINT user_activities_activity_type_check
CHECK (activity_type IN (
  'resume_updated',
  'skill_learned',
  'job_applied',
  'job_saved',
  'job_viewed',
  'profile_updated',
  'goal_set',
  'daily_task_completed',
  'networking_activity',
  'milestone_achieved',
  'streak_milestone'
));

-- 2. Ensure career_milestones table supports all milestone types
ALTER TABLE career_milestones
DROP CONSTRAINT IF EXISTS career_milestones_milestone_type_check;

ALTER TABLE career_milestones
ADD CONSTRAINT career_milestones_milestone_type_check
CHECK (milestone_type IN (
  'application_goal',
  'skill_development',
  'networking',
  'interview_prep',
  'daily_activity_goal',
  'weekly_application_target'
));

-- 3. Add indexes for better performance on new queries
CREATE INDEX IF NOT EXISTS idx_user_activities_daily_tasks
ON user_activities(user_id, activity_type, created_at)
WHERE activity_type = 'daily_task_completed';

CREATE INDEX IF NOT EXISTS idx_user_activities_recent
ON user_activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_interactions_recent
ON job_interactions(user_id, created_at DESC);

-- 4. Create a view for daily progress (optional but helpful)
CREATE OR REPLACE VIEW daily_progress AS
SELECT
  user_id,
  DATE(created_at) as activity_date,
  COUNT(*) as total_activities,
  COUNT(CASE WHEN activity_type = 'daily_task_completed' THEN 1 END) as tasks_completed,
  COUNT(CASE WHEN activity_type = 'networking_activity' THEN 1 END) as networking_activities,
  COUNT(CASE WHEN activity_type = 'job_applied' THEN 1 END) as applications,
  COALESCE(SUM(CAST(activity_data->>'points_earned' AS INTEGER)), 0) as points_earned
FROM user_activities
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, DATE(created_at);

-- 5. Create a function to calculate current streak (optional)
CREATE OR REPLACE FUNCTION get_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_activity BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_activities
      WHERE user_id = p_user_id
        AND DATE(created_at) = check_date
        AND activity_type = 'daily_task_completed'
    ) INTO has_activity;

    IF has_activity THEN
      streak_count := streak_count + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;

    -- Safety limit to prevent infinite loops
    IF streak_count > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Sample data for testing (uncomment if you want test data)
/*
-- Insert some sample daily task completions for testing
INSERT INTO user_activities (user_id, activity_type, activity_data) VALUES
(auth.uid(), 'daily_task_completed', '{"task_id": "daily_2024-01-01_0", "task_type": "job_search", "points_earned": 15, "streak_eligible": true}'),
(auth.uid(), 'daily_task_completed', '{"task_id": "daily_2024-01-01_1", "task_type": "networking", "points_earned": 20, "streak_eligible": true}');

-- Insert some networking activities
INSERT INTO user_activities (user_id, activity_type, activity_data) VALUES
(auth.uid(), 'networking_activity', '{"type": "linkedin_message", "description": "Connected with 2 professionals", "count": 2}');
*/

-- 7. Create resume_analyses table for storing resume analysis results
CREATE TABLE IF NOT EXISTS resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_text TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  marketability_score INTEGER CHECK (marketability_score >= 0 AND marketability_score <= 100),
  target_role VARCHAR(100),
  career_stage VARCHAR(20) CHECK (career_stage IN ('entry', 'mid', 'senior', 'executive')),
  industry_focus VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) for resume_analyses
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own analyses
CREATE POLICY "Users can view own resume analyses" ON resume_analyses
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own analyses
CREATE POLICY "Users can insert own resume analyses" ON resume_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own analyses
CREATE POLICY "Users can update own resume analyses" ON resume_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses(user_id, created_at DESC);

-- 8. Check what we have (run this to verify)
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name IN ('user_activities', 'career_milestones', 'job_interactions', 'resume_analyses')
-- ORDER BY table_name, column_name;