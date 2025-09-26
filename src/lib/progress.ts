export interface CareerMilestone {
  id: string
  user_id: string
  career_objective_id: string
  milestone_type: 'application_goal' | 'skill_development' | 'networking' | 'interview_prep'
  title: string
  description?: string
  target_value: number
  current_value: number
  target_date: string
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  created_at: string
  updated_at: string
}

export interface WeeklyProgress {
  id: string
  user_id: string
  week_start: string
  applications_count: number
  jobs_viewed: number
  jobs_saved: number
  resume_updates: number
  skill_progress_updates: number
  networking_activities: number
  interview_count: number
  momentum_score: number
  goal_progress_percentage: number
  ai_insights?: {
    weekly_summary: string
    key_achievements: string[]
    areas_for_improvement: string[]
    next_week_priorities: string[]
    benchmark_comparison: {
      applications_vs_peers: number
      response_rate_vs_peers: number
      overall_ranking: 'top_quartile' | 'above_average' | 'average' | 'below_average'
    }
  }
  generated_at: string
  created_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: 'resume_updated' | 'skill_learned' | 'job_applied' | 'profile_updated' | 'goal_set' | 'job_saved' | 'job_viewed'
  activity_data: {
    [key: string]: any
  }
  points_earned: number
  created_at: string
}

export interface CareerBenchmark {
  id: string
  career_stage: string
  target_role: string
  location_type?: string
  avg_applications_per_week: number
  avg_interview_rate: number
  avg_response_rate: number
  avg_time_to_offer_days: number
  sample_size: number
  last_updated: string
}

export interface ProgressSummary {
  current_week: WeeklyProgress
  milestones: CareerMilestone[]
  recent_activities: UserActivity[]
  benchmark_comparison: {
    your_performance: {
      applications_per_week: number
      response_rate: number
      interview_rate: number
    }
    peer_average: {
      applications_per_week: number
      response_rate: number
      interview_rate: number
    }
    performance_delta: {
      applications: number
      response_rate: number
      interview_rate: number
    }
  }
  weekly_streak: number
  momentum_trend: 'improving' | 'stable' | 'declining'
  next_milestones: CareerMilestone[]
  ai_recommendations: string[]
}