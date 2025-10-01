// Comprehensive User Data Snapshot for Intelligence Dashboard
// Aggregates all user data from multiple tables for AI analysis

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export interface UserSnapshot {
  // Basic Info
  user_id: string
  has_completed_setup: boolean
  setup_completion_percentage: number

  // Profile Data
  profile: {
    full_name: string | null
    current_role: string | null
    years_experience: number | null
    location: string | null
    current_salary: number | null
    education_level: string | null
    skills: string[]
    bio: string | null
  } | null

  // Career Objectives
  objectives: {
    target_role: string | null
    industry: string | null
    career_stage: string | null
    primary_goal: string | null
    timeline: string | null
    target_salary: number | null
    work_preference: string | null
  } | null

  // Resume Analysis
  resume: {
    has_resume: boolean
    latest_score: number | null
    analysis: {
      strengths: string[]
      weaknesses: string[]
      skills_identified: string[]
      experience_level: string | null
      marketability_score: number | null
    } | null
    analyzed_at: string | null
  }

  // Job Search Activity
  job_activity: {
    total_viewed: number
    total_saved: number
    total_applied: number
    total_dismissed: number
    last_application_date: string | null
    avg_match_score: number | null
  }

  // Career Progress
  progress: {
    active_milestones: number
    completed_milestones: number
    current_week_applications: number
    current_week_momentum: number
    weekly_streak: number
    total_points: number
  }

  // Engagement Metrics
  engagement: {
    days_since_signup: number
    total_activities: number
    last_active: string | null
    engagement_level: 'high' | 'medium' | 'low'
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await userSupabase.auth.getUser()
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' })
    }

    logger.info('Generating user snapshot for intelligence dashboard', 'API', { userId: user.id })

    // Fetch all data in parallel for performance
    const [
      profileResult,
      objectivesResult,
      resumesResult,
      resumeAnalysesResult,
      jobInteractionsResult,
      milestonesResult,
      weeklyProgressResult,
      activitiesResult
    ] = await Promise.all([
      userSupabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
      userSupabase.from('career_objectives').select('*').eq('user_id', user.id).single(),
      userSupabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      userSupabase.from('resume_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      userSupabase.from('job_interactions').select('*').eq('user_id', user.id),
      userSupabase.from('career_milestones').select('*').eq('user_id', user.id),
      userSupabase.from('weekly_progress').select('*').eq('user_id', user.id).order('week_start', { ascending: false }).limit(4),
      userSupabase.from('user_activities').select('*').eq('user_id', user.id)
    ])

    // Calculate setup completion
    const hasProfile = !!profileResult.data?.full_name
    const hasObjectives = !!objectivesResult.data
    const hasResume = resumesResult.data && resumesResult.data.length > 0

    const completedSteps = [hasProfile, hasObjectives, hasResume].filter(Boolean).length
    const setupPercentage = Math.round((completedSteps / 3) * 100)

    // Build resume snapshot
    const latestResume = resumesResult.data?.[0]

    let resumeSkills: string[] = []
    let resumeStrengths: string[] = []
    let resumeWeaknesses: string[] = []
    let marketabilityScore: number | null = null

    if (latestResume?.ai_analysis) {
      const analysis = latestResume.ai_analysis as any
      resumeSkills = analysis.skills_identified || analysis.technical_skills || []
      resumeStrengths = analysis.strengths || []
      resumeWeaknesses = analysis.weaknesses || analysis.areas_for_improvement || []
      marketabilityScore = analysis.marketability_score || analysis.overall_assessment?.marketability_score
    }

    // Calculate job activity metrics
    const jobInteractions = jobInteractionsResult.data || []
    const appliedJobs = jobInteractions.filter(j => j.interaction_type === 'applied')
    const avgMatchScore = jobInteractions
      .filter(j => j.ai_match_score !== null)
      .reduce((sum, j) => sum + (j.ai_match_score || 0), 0) / jobInteractions.length || null

    // Calculate progress metrics
    const milestones = milestonesResult.data || []
    const activeMilestones = milestones.filter(m => m.status === 'active').length
    const completedMilestones = milestones.filter(m => m.status === 'completed').length

    const currentWeek = weeklyProgressResult.data?.[0]
    const weeklyStreak = calculateWeeklyStreak(weeklyProgressResult.data || [])

    // Calculate engagement
    const activities = activitiesResult.data || []
    const totalPoints = activities.reduce((sum, a) => sum + (a.points_earned || 0), 0)
    const lastActivity = activities[0]?.created_at

    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    const engagementLevel = activities.length > 20 ? 'high' : activities.length > 5 ? 'medium' : 'low'

    const snapshot: UserSnapshot = {
      user_id: user.id,
      has_completed_setup: completedSteps === 3,
      setup_completion_percentage: setupPercentage,

      profile: profileResult.data ? {
        full_name: profileResult.data.full_name,
        current_role: profileResult.data.current_role,
        years_experience: profileResult.data.years_experience,
        location: profileResult.data.location,
        current_salary: profileResult.data.current_salary,
        education_level: profileResult.data.education_level,
        skills: profileResult.data.skills || [],
        bio: profileResult.data.bio
      } : null,

      objectives: objectivesResult.data ? {
        target_role: objectivesResult.data.target_role,
        industry: objectivesResult.data.industry,
        career_stage: objectivesResult.data.career_stage,
        primary_goal: objectivesResult.data.primary_goal,
        timeline: objectivesResult.data.timeline,
        target_salary: objectivesResult.data.target_salary,
        work_preference: objectivesResult.data.work_preference
      } : null,

      resume: {
        has_resume: !!hasResume,
        latest_score: latestResume?.score || null,
        analysis: latestResume ? {
          strengths: resumeStrengths,
          weaknesses: resumeWeaknesses,
          skills_identified: resumeSkills,
          experience_level: (latestResume.ai_analysis as any)?.experience_level || null,
          marketability_score: marketabilityScore
        } : null,
        analyzed_at: latestResume?.created_at || null
      },

      job_activity: {
        total_viewed: jobInteractions.filter(j => j.interaction_type === 'viewed').length,
        total_saved: jobInteractions.filter(j => j.interaction_type === 'saved').length,
        total_applied: appliedJobs.length,
        total_dismissed: jobInteractions.filter(j => j.interaction_type === 'dismissed').length,
        last_application_date: appliedJobs.length > 0
          ? appliedJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null,
        avg_match_score: avgMatchScore
      },

      progress: {
        active_milestones: activeMilestones,
        completed_milestones: completedMilestones,
        current_week_applications: currentWeek?.applications_count || 0,
        current_week_momentum: currentWeek?.momentum_score || 0,
        weekly_streak: weeklyStreak,
        total_points: totalPoints
      },

      engagement: {
        days_since_signup: daysSinceSignup,
        total_activities: activities.length,
        last_active: lastActivity,
        engagement_level: engagementLevel
      }
    }

    logger.info('User snapshot generated successfully', 'API', {
      userId: user.id,
      setupComplete: snapshot.has_completed_setup,
      hasResume: snapshot.resume.has_resume
    })

    return res.status(200).json({ success: true, snapshot })

  } catch (error: any) {
    logger.error('Failed to generate user snapshot', 'API', { error: error.message })
    return res.status(500).json({ error: 'Failed to generate user snapshot' })
  }
}

function calculateWeeklyStreak(weeklyProgress: any[]): number {
  if (!weeklyProgress || weeklyProgress.length === 0) return 0

  let streak = 0
  const sorted = [...weeklyProgress].sort((a, b) =>
    new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
  )

  for (const week of sorted) {
    if (week.applications_count > 0 || week.momentum_score > 0) {
      streak++
    } else {
      break
    }
  }

  return streak
}
