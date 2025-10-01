-- Subscription Management & Rate Limiting Schema
-- Comprehensive system for managing Free vs Pro plans

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_annual INTEGER NOT NULL, -- in cents
  features JSONB NOT NULL,
  limits JSONB NOT NULL, -- { ai_insights_per_month: 5, daily_tasks: false, etc }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id VARCHAR(50) REFERENCES subscription_plans(id) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  billing_period VARCHAR(20), -- monthly, annual
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Tracking Table (for rate limiting and analytics)
CREATE TABLE IF NOT EXISTS user_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type VARCHAR(100) NOT NULL, -- 'ai_insights', 'career_predictions', 'skills_analysis', etc
  usage_count INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, resource_type, period_start)
);

-- API Rate Limiting Table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, endpoint, window_start)
);

-- Subscription Events Log (for audit trail)
CREATE TABLE IF NOT EXISTS subscription_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'subscription_created', 'upgraded', 'downgraded', 'canceled', 'renewed'
  old_plan_id VARCHAR(50),
  new_plan_id VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (id, name, description, price_monthly, price_annual, features, limits) VALUES
('free', 'Free', 'Perfect for exploring career options', 0, 0,
  '{
    "basic_job_search": true,
    "basic_salary_data": true,
    "simple_career_tracking": true,
    "community_support": true
  }',
  '{
    "ai_insights_per_month": 5,
    "career_predictions": false,
    "skills_gap_analysis": false,
    "networking_tracker": "limited",
    "daily_tasks": false,
    "salary_forecasting": "current_only",
    "career_path_mapping": false,
    "job_market_trends": false,
    "priority_support": false
  }'
),
('pro', 'Pro', 'For serious career growth', 1500, 14400,
  '{
    "unlimited_ai_insights": true,
    "advanced_predictions": true,
    "skills_gap_analysis": true,
    "full_networking_tracker": true,
    "daily_personalized_tasks": true,
    "gamification": true,
    "salary_forecasting_18m": true,
    "career_path_mapping": true,
    "job_market_trends": true,
    "priority_support": true,
    "early_access": true
  }',
  '{
    "ai_insights_per_month": -1,
    "career_predictions": true,
    "skills_gap_analysis": true,
    "networking_tracker": "full",
    "daily_tasks": true,
    "salary_forecasting": "18_months",
    "career_path_mapping": true,
    "job_market_trends": true,
    "priority_support": true
  }'
)
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  updated_at = NOW();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_resource ON user_usage(user_id, resource_type, period_start);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint, window_start);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY user_subscriptions_policy ON user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_usage_policy ON user_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY api_rate_limits_policy ON api_rate_limits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY subscription_events_policy ON subscription_events
  FOR ALL USING (auth.uid() = user_id);

-- Function to get user subscription with limits
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  plan_id VARCHAR(50),
  plan_name VARCHAR(100),
  status VARCHAR(50),
  limits JSONB,
  is_trial BOOLEAN,
  trial_ends_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id as plan_id,
    sp.name as plan_name,
    us.status,
    sp.limits,
    (us.trial_end IS NOT NULL AND us.trial_end > NOW()) as is_trial,
    us.trial_end as trial_ends_at
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id;

  -- If no subscription exists, return free plan
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      'free'::VARCHAR(50) as plan_id,
      'Free'::VARCHAR(100) as plan_name,
      'active'::VARCHAR(50) as status,
      sp.limits,
      FALSE as is_trial,
      NULL::TIMESTAMP WITH TIME ZONE as trial_ends_at
    FROM subscription_plans sp
    WHERE sp.id = 'free';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has exceeded usage limit
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_resource_type VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_current_usage INTEGER;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the current period (monthly)
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  -- Get user's limit for this resource
  SELECT (sp.limits->p_resource_type)::INTEGER INTO v_limit
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id;

  -- If no subscription or limit not found, use free plan defaults
  IF v_limit IS NULL THEN
    SELECT (limits->p_resource_type)::INTEGER INTO v_limit
    FROM subscription_plans
    WHERE id = 'free';
  END IF;

  -- -1 means unlimited
  IF v_limit = -1 THEN
    RETURN FALSE;
  END IF;

  -- Get current usage
  SELECT COALESCE(usage_count, 0) INTO v_current_usage
  FROM user_usage
  WHERE user_id = p_user_id
    AND resource_type = p_resource_type
    AND period_start = v_period_start;

  -- Check if limit exceeded
  RETURN v_current_usage >= v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_resource_type VARCHAR(100),
  p_increment INTEGER DEFAULT 1
) RETURNS INTEGER AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
  v_new_count INTEGER;
BEGIN
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  INSERT INTO user_usage (user_id, resource_type, usage_count, period_start, period_end)
  VALUES (p_user_id, p_resource_type, p_increment, v_period_start, v_period_end)
  ON CONFLICT (user_id, resource_type, period_start)
  DO UPDATE SET
    usage_count = user_usage.usage_count + p_increment,
    updated_at = NOW()
  RETURNING usage_count INTO v_new_count;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check API rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint VARCHAR(255),
  p_max_requests INTEGER DEFAULT 100,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_window_end TIMESTAMP WITH TIME ZONE;
  v_request_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', NOW());
  v_window_end := v_window_start + (p_window_seconds || ' seconds')::INTERVAL;

  -- Get current count
  SELECT COALESCE(request_count, 0) INTO v_request_count
  FROM api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_start = v_window_start;

  -- Increment count
  INSERT INTO api_rate_limits (user_id, endpoint, request_count, window_start, window_end)
  VALUES (p_user_id, p_endpoint, 1, v_window_start, v_window_end)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET
    request_count = api_rate_limits.request_count + 1;

  -- Return true if limit exceeded
  RETURN v_request_count >= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger would need to be created on auth.users table in Supabase dashboard
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Cleanup old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM api_rate_limits
  WHERE window_end < NOW() - INTERVAL '1 hour';

  DELETE FROM user_usage
  WHERE period_end < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE subscription_plans IS 'Available subscription plans with features and limits';
COMMENT ON TABLE user_subscriptions IS 'User subscription status and billing information';
COMMENT ON TABLE user_usage IS 'Tracks usage of rate-limited resources per user per period';
COMMENT ON TABLE api_rate_limits IS 'API request rate limiting per endpoint';
COMMENT ON TABLE subscription_events IS 'Audit log of subscription changes';
COMMENT ON FUNCTION get_user_subscription IS 'Gets user subscription with plan details and limits';
COMMENT ON FUNCTION check_usage_limit IS 'Checks if user has exceeded usage limit for a resource';
COMMENT ON FUNCTION increment_usage IS 'Increments usage counter for a resource';
COMMENT ON FUNCTION check_rate_limit IS 'Checks and increments API rate limit counter';
