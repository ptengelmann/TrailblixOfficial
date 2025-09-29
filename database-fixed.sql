-- Advanced AI Intelligence System Database Schema (FIXED)
-- Supporting real-time market intelligence and predictive career modeling

-- Market Intelligence Cache Table
CREATE TABLE IF NOT EXISTS market_intelligence_cache (
  id BIGSERIAL PRIMARY KEY,
  analysis_type VARCHAR(50) NOT NULL,
  target_role VARCHAR(255),
  location VARCHAR(255) DEFAULT 'global',
  industry VARCHAR(255),
  experience_level VARCHAR(50),
  analysis_data JSONB NOT NULL,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Predictions Table
CREATE TABLE IF NOT EXISTS career_predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "current_role" VARCHAR(255) NOT NULL,
  years_experience INTEGER,
  industry VARCHAR(255),
  location VARCHAR(255),
  prediction_timeframe VARCHAR(10) NOT NULL,
  prediction_data JSONB NOT NULL,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Progression Patterns Table (for ML training data)
CREATE TABLE IF NOT EXISTS career_progression_patterns (
  id BIGSERIAL PRIMARY KEY,
  from_role VARCHAR(255) NOT NULL,
  to_role VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  years_experience_range VARCHAR(50),
  timeline VARCHAR(50),
  frequency INTEGER DEFAULT 1,
  success_rate DECIMAL(5,2),
  salary_change_percentage DECIMAL(5,2),
  key_skills_required TEXT[],
  transition_difficulty VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Trends Analysis Table
CREATE TABLE IF NOT EXISTS market_trends (
  id BIGSERIAL PRIMARY KEY,
  role_category VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  location VARCHAR(255) DEFAULT 'global',
  metric_name VARCHAR(255) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  trend_direction VARCHAR(20),
  data_source VARCHAR(255),
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Intelligence Table
CREATE TABLE IF NOT EXISTS skills_intelligence (
  id BIGSERIAL PRIMARY KEY,
  skill_name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  demand_score INTEGER,
  growth_rate DECIMAL(5,2),
  salary_impact DECIMAL(5,2),
  rarity_index DECIMAL(3,2),
  market_location VARCHAR(255) DEFAULT 'global',
  data_source VARCHAR(255),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Market Analytics Table (real-time job data processing)
CREATE TABLE IF NOT EXISTS job_market_analytics (
  id BIGSERIAL PRIMARY KEY,
  job_title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  location VARCHAR(255),
  salary_min INTEGER,
  salary_max INTEGER,
  currency VARCHAR(10) DEFAULT 'USD',
  employment_type VARCHAR(50),
  remote_type VARCHAR(50),
  required_skills TEXT[],
  years_experience_required INTEGER,
  job_description_summary TEXT,
  posting_date DATE,
  data_source VARCHAR(255) NOT NULL,
  external_id VARCHAR(255),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(external_id, data_source)
);

-- Salary Benchmarking Table
CREATE TABLE IF NOT EXISTS salary_benchmarks (
  id BIGSERIAL PRIMARY KEY,
  role_title VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  experience_level VARCHAR(50),
  percentile_10 INTEGER,
  percentile_25 INTEGER,
  percentile_50 INTEGER,
  percentile_75 INTEGER,
  percentile_90 INTEGER,
  currency VARCHAR(10) DEFAULT 'USD',
  sample_size INTEGER,
  confidence_level DECIMAL(3,2),
  data_collection_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Career Intelligence Reports
CREATE TABLE IF NOT EXISTS career_intelligence_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Intelligence Subscriptions (for real-time updates)
CREATE TABLE IF NOT EXISTS market_intelligence_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL,
  parameters JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Analytics for System Improvement
CREATE TABLE IF NOT EXISTS prediction_accuracy_tracking (
  id BIGSERIAL PRIMARY KEY,
  prediction_id BIGINT REFERENCES career_predictions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_type VARCHAR(50) NOT NULL,
  predicted_outcome JSONB NOT NULL,
  actual_outcome JSONB,
  accuracy_score DECIMAL(5,2),
  feedback_received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_intelligence_role_location ON market_intelligence_cache(target_role, location);
CREATE INDEX IF NOT EXISTS idx_career_predictions_user_role ON career_predictions(user_id, "current_role");
CREATE INDEX IF NOT EXISTS idx_progression_patterns_roles ON career_progression_patterns(from_role, to_role, industry);
CREATE INDEX IF NOT EXISTS idx_market_trends_role_date ON market_trends(role_category, date_recorded);
CREATE INDEX IF NOT EXISTS idx_skills_intelligence_demand ON skills_intelligence(skill_name, demand_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_analytics_title_location ON job_market_analytics(job_title, location, posting_date);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_role_location ON salary_benchmarks(role_title, location, experience_level);
CREATE INDEX IF NOT EXISTS idx_intelligence_reports_user_type ON career_intelligence_reports(user_id, report_type);

-- Row Level Security (RLS) Policies
ALTER TABLE career_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_intelligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_accuracy_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY career_predictions_user_policy ON career_predictions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY intelligence_reports_user_policy ON career_intelligence_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY intelligence_subscriptions_user_policy ON market_intelligence_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY prediction_tracking_user_policy ON prediction_accuracy_tracking
  FOR ALL USING (auth.uid() = user_id);

-- Sample data for testing
INSERT INTO career_progression_patterns (from_role, to_role, industry, years_experience_range, timeline, frequency, success_rate, salary_change_percentage, key_skills_required, transition_difficulty) VALUES
('Software Engineer', 'Senior Software Engineer', 'Technology', '3-5', '18-24 months', 1250, 87.5, 25.0, ARRAY['System Design', 'Leadership', 'Advanced Programming'], 'medium'),
('Software Engineer', 'Tech Lead', 'Technology', '4-7', '24-36 months', 890, 72.3, 45.0, ARRAY['Team Leadership', 'Architecture', 'Project Management'], 'high'),
('Product Manager', 'Senior Product Manager', 'Technology', '2-4', '12-18 months', 650, 91.2, 30.0, ARRAY['Strategy', 'Analytics', 'Stakeholder Management'], 'medium'),
('Data Analyst', 'Data Scientist', 'Technology', '2-3', '12-24 months', 420, 68.9, 35.0, ARRAY['Machine Learning', 'Python', 'Statistics'], 'medium');

INSERT INTO skills_intelligence (skill_name, category, demand_score, growth_rate, salary_impact, rarity_index, market_location) VALUES
('Python', 'technical', 95, 23.5, 15.0, 0.3, 'global'),
('Machine Learning', 'technical', 92, 67.8, 25.0, 0.7, 'global'),
('React', 'technical', 88, 12.4, 8.0, 0.2, 'global'),
('Leadership', 'soft', 85, 5.2, 20.0, 0.5, 'global'),
('Kubernetes', 'technical', 89, 45.6, 18.0, 0.6, 'global'),
('System Design', 'technical', 91, 34.2, 22.0, 0.8, 'global');