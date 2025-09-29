// API type definitions to replace any types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UserProfile {
  user_id: string
  full_name: string | null
  email: string | null
  current_role: string | null
  location: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  bio: string | null
  years_experience: number | null
  created_at: string
  updated_at: string
}

export interface CareerObjectives {
  id: string
  user_id: string
  target_role: string | null
  target_industry: string | null
  career_stage: 'entry' | 'mid' | 'senior' | 'executive' | null
  primary_goal: 'job_search' | 'skill_development' | 'career_change' | 'promotion' | null
  timeline: 'immediate' | 'short' | 'medium' | 'long' | null
  work_preference: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
  salary_expectations: {
    min: number | null
    max: number | null
    currency: string
  } | null
  created_at: string
  updated_at: string
}

export interface JobInteraction {
  id: string
  user_id: string
  job_id: string
  interaction_type: 'viewed' | 'saved' | 'applied' | 'dismissed'
  job_data: Record<string, unknown>
  ai_analysis: Record<string, unknown> | null
  created_at: string
}

export interface ResumeAnalysis {
  score: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  extracted_skills?: {
    technical: Array<{
      skill: string
      confidence: number
      category: string
      years_experience?: number
      proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    }>
    soft: Array<{
      skill: string
      confidence: number
      evidence: string[]
    }>
  }
}

export interface ResumeAnalysisRecord {
  id: string
  user_id: string
  resume_text: string
  analysis_data: ResumeAnalysis
  marketability_score: number | null
  target_role: string | null
  career_stage: 'entry' | 'mid' | 'senior' | 'executive' | null
  industry_focus: string | null
  created_at: string
  updated_at: string
}

export type DatabaseError = {
  message: string
  code?: string
  hint?: string
}