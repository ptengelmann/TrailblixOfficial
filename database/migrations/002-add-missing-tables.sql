-- Migration: Add Missing Tables
-- Created: 2025-10-01
-- Description: Creates missing tables referenced in application code
-- Note: 'resumes' table already exists, so it's excluded from this migration

-- ============================================
-- 1. CAREER RECOMMENDATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS career_recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT DEFAULT 'general', -- 'general', 'job_specific', 'skill_development', 'networking'
  recommendation_data JSONB NOT NULL,
  priority INTEGER DEFAULT 1, -- 1 (highest) to 5 (lowest)
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'dismissed'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_career_recommendations_user_id ON career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_career_recommendations_status ON career_recommendations(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_career_recommendations_priority ON career_recommendations(priority, created_at DESC);

-- RLS Policies
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY career_recommendations_user_policy ON career_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 2. CAREER BENCHMARKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS career_benchmarks (
  id BIGSERIAL PRIMARY KEY,
  career_stage TEXT NOT NULL, -- 'entry', 'mid', 'senior', 'executive'
  target_role TEXT NOT NULL,
  industry TEXT,
  location TEXT DEFAULT 'United States',
  avg_applications_per_week NUMERIC(5,2) DEFAULT 5.0,
  avg_response_rate NUMERIC(5,2) DEFAULT 15.0, -- percentage
  avg_interview_rate NUMERIC(5,2) DEFAULT 8.0, -- percentage
  avg_time_to_hire_days INTEGER DEFAULT 60,
  avg_salary_range_min INTEGER,
  avg_salary_range_max INTEGER,
  sample_size INTEGER DEFAULT 0, -- how many data points this is based on
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_career_benchmark UNIQUE(career_stage, target_role, industry, location)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_career_benchmarks_lookup ON career_benchmarks(career_stage, target_role);
CREATE INDEX IF NOT EXISTS idx_career_benchmarks_industry ON career_benchmarks(industry, career_stage);

-- This table doesn't need RLS as it's reference data, but we'll make it read-only for authenticated users
ALTER TABLE career_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY career_benchmarks_read_policy ON career_benchmarks
  FOR SELECT USING (true); -- Anyone can read benchmarks

-- ============================================
-- 3. JOB SEARCH SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS job_search_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT,
  filters JSONB DEFAULT '{}', -- Stores location, salary, remote preferences, etc.
  results_count INTEGER DEFAULT 0,
  results_data JSONB, -- Store search results for caching
  search_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours' -- Cache for 24 hours
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_search_sessions_user_id ON job_search_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_search_sessions_expires ON job_search_sessions(expires_at);

-- RLS Policies
ALTER TABLE job_search_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY job_search_sessions_user_policy ON job_search_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA FOR CAREER BENCHMARKS
-- ============================================

INSERT INTO career_benchmarks (career_stage, target_role, industry, location, avg_applications_per_week, avg_response_rate, avg_interview_rate, avg_time_to_hire_days, avg_salary_range_min, avg_salary_range_max, sample_size) VALUES
-- Software Engineering
('entry', 'Software Engineer', 'Technology', 'United States', 8.0, 12.0, 6.0, 45, 70000, 95000, 1500),
('mid', 'Software Engineer', 'Technology', 'United States', 6.0, 15.0, 8.0, 35, 95000, 130000, 2000),
('senior', 'Senior Software Engineer', 'Technology', 'United States', 5.0, 18.0, 12.0, 40, 130000, 180000, 1200),
('senior', 'Staff Software Engineer', 'Technology', 'United States', 4.0, 15.0, 10.0, 50, 160000, 220000, 800),

-- Product Management
('mid', 'Product Manager', 'Technology', 'United States', 7.0, 14.0, 9.0, 42, 100000, 140000, 900),
('senior', 'Senior Product Manager', 'Technology', 'United States', 5.0, 16.0, 11.0, 45, 140000, 190000, 650),
('executive', 'Director of Product', 'Technology', 'United States', 3.0, 12.0, 8.0, 60, 180000, 250000, 400),

-- Data Science
('entry', 'Data Analyst', 'Technology', 'United States', 9.0, 13.0, 7.0, 40, 65000, 85000, 1100),
('mid', 'Data Scientist', 'Technology', 'United States', 6.0, 16.0, 10.0, 38, 95000, 135000, 950),
('senior', 'Senior Data Scientist', 'Technology', 'United States', 4.0, 17.0, 12.0, 42, 135000, 185000, 600),

-- UX/UI Design
('mid', 'UX Designer', 'Technology', 'United States', 7.0, 14.0, 9.0, 40, 80000, 110000, 700),
('senior', 'Senior UX Designer', 'Technology', 'United States', 5.0, 16.0, 11.0, 43, 110000, 150000, 450),

-- Engineering Management
('senior', 'Engineering Manager', 'Technology', 'United States', 4.0, 14.0, 10.0, 55, 150000, 200000, 550),
('executive', 'Director of Engineering', 'Technology', 'United States', 3.0, 12.0, 8.0, 65, 200000, 280000, 300),

-- DevOps/SRE
('mid', 'DevOps Engineer', 'Technology', 'United States', 6.0, 15.0, 9.0, 38, 95000, 130000, 850),
('senior', 'Site Reliability Engineer', 'Technology', 'United States', 5.0, 17.0, 11.0, 40, 130000, 175000, 600),

-- Marketing
('mid', 'Marketing Manager', 'Technology', 'United States', 8.0, 13.0, 8.0, 42, 75000, 105000, 800),
('senior', 'Senior Marketing Manager', 'Technology', 'United States', 5.0, 15.0, 10.0, 48, 105000, 145000, 500)
ON CONFLICT (career_stage, target_role, industry, location) DO UPDATE SET
  avg_applications_per_week = EXCLUDED.avg_applications_per_week,
  avg_response_rate = EXCLUDED.avg_response_rate,
  avg_interview_rate = EXCLUDED.avg_interview_rate,
  avg_time_to_hire_days = EXCLUDED.avg_time_to_hire_days,
  avg_salary_range_min = EXCLUDED.avg_salary_range_min,
  avg_salary_range_max = EXCLUDED.avg_salary_range_max,
  sample_size = EXCLUDED.sample_size,
  last_updated = NOW();

-- ============================================
-- CLEANUP OLD SESSIONS (Optional Cron Job)
-- ============================================

-- Create function to clean up expired search sessions
CREATE OR REPLACE FUNCTION cleanup_expired_search_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM job_search_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE career_recommendations IS 'AI-generated career recommendations for users';
COMMENT ON TABLE career_benchmarks IS 'Industry benchmark data for career progression metrics';
COMMENT ON TABLE job_search_sessions IS 'Caches job search results to improve performance';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the migration succeeded:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('career_recommendations', 'career_benchmarks', 'job_search_sessions');
-- SELECT COUNT(*) as benchmark_count FROM career_benchmarks;
