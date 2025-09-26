// src/pages/api/career-progress.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ProgressCalculator } from '@/lib/progressCalculations'
import { WeeklyProgress, CareerMilestone, ProgressSummary } from '@/types/progress'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ProgressRequest {
  action: 'get_summary' | 'update_milestone' | 'track_activity' | 'generate_insights'
  milestone_id?: string
  milestone_updates?: Partial<CareerMilestone>
  activity_type?: string
  activity_data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    const requestData = req.body as ProgressRequest
    const { action } = requestData

    switch (action) {
      case 'get_summary':
        return await getProgressSummary(res, userSupabase, user.id)
      
      case 'update_milestone':
        return await updateMilestone(res, userSupabase, user.id, requestData)
      
      case 'track_activity':
        return await trackActivity(res, userSupabase, user.id, requestData)
        
      case 'generate_insights':
        return await generateWeeklyInsights(res, userSupabase, user.id)
      
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

  } catch (error: any) {
    console.error('Progress tracking error:', error)
    return res.status(500).json({ error: 'Failed to process request' })
  }
}

async function getProgressSummary(res: NextApiResponse, userSupabase: any, userId: string) {
  try {
    // Get current week's start date (Monday)
    const now = new Date()
    const currentWeekStart = new Date(now)
    const day = currentWeekStart.getDay()
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1)
    currentWeekStart.setDate(diff)
    currentWeekStart.setHours(0, 0, 0, 0)
    const weekStart = currentWeekStart.toISOString().split('T')[0]

    // Parallel data fetching
    const [
      milestones,
      weeklyProgress,
      recentActivities,
      careerObjectives,
      jobInteractions
    ] = await Promise.all([
      // Get milestones
      userSupabase
        .from('career_milestones')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true }),
      
      // Get last 4 weeks of progress
      userSupabase
        .from('weekly_progress')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: false })
        .limit(4),
      
      // Get recent activities
      userSupabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
        
      // Get career objectives for benchmarking
      userSupabase
        .from('career_objectives')
        .select('*')
        .eq('user_id', userId)
        .single(),
        
      // Get this week's job interactions for current week calculation
      userSupabase
        .from('job_interactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', currentWeekStart.toISOString())
    ])

    // Calculate current week data if not exists
    let currentWeek = weeklyProgress.data?.find((w: any) => w.week_start === weekStart)
    
    if (!currentWeek) {
      // Create current week progress from job interactions
      const thisWeekJobs = jobInteractions.data || []
      const weeklyData = {
        applications_count: thisWeekJobs.filter((j: any) => j.interaction_type === 'applied').length,
        jobs_viewed: thisWeekJobs.filter((j: any) => j.interaction_type === 'viewed').length,
        jobs_saved: thisWeekJobs.filter((j: any) => j.interaction_type === 'saved').length,
        resume_updates: 0, // Would need to track this separately
        skill_progress_updates: 0, // Would need to track this separately
        networking_activities: 0, // Would need to track this separately
        interview_count: 0 // Would need to track this separately
      }

      const momentumScore = ProgressCalculator.calculateMomentumScore(weeklyData)
      const goalProgress = ProgressCalculator.calculateGoalProgress(milestones.data || [])

      // Insert current week
      const { data: newWeek } = await userSupabase
        .from('weekly_progress')
        .upsert({
          user_id: userId,
          week_start: weekStart,
          ...weeklyData,
          momentum_score: momentumScore,
          goal_progress_percentage: goalProgress
        }, { 
          onConflict: 'user_id,week_start' 
        })
        .select()
        .single()

      currentWeek = newWeek
    }

    // Calculate benchmark comparison
    let benchmarkComparison = null
    if (careerObjectives.data) {
      const benchmark = await getBenchmarkData(userSupabase, careerObjectives.data)
      benchmarkComparison = calculateBenchmarkComparison(currentWeek, benchmark)
    }

    // Calculate trends and streaks
    const weeklyStreak = ProgressCalculator.calculateWeeklyStreak(weeklyProgress.data || [])
    const momentumTrend = ProgressCalculator.calculateMomentumTrend(weeklyProgress.data || [])
    const nextMilestones = ProgressCalculator.getNextPriorityMilestones(milestones.data || [])

    const summary: ProgressSummary = {
      current_week: currentWeek,
      milestones: milestones.data || [],
      recent_activities: recentActivities.data || [],
      benchmark_comparison: benchmarkComparison || {
        your_performance: {
          applications_per_week: currentWeek.applications_count,
          response_rate: 0,
          interview_rate: 0
        },
        peer_average: {
          applications_per_week: 5,
          response_rate: 15,
          interview_rate: 8
        },
        performance_delta: {
          applications: -20,
          response_rate: -15,
          interview_rate: -8
        }
      },
      weekly_streak: weeklyStreak,
      momentum_trend: momentumTrend,
      next_milestones: nextMilestones,
      ai_recommendations: []
    }

    // Generate AI recommendations
    summary.ai_recommendations = ProgressCalculator.generateRecommendations(summary)

    return res.status(200).json({ success: true, data: summary })

  } catch (error: any) {
    console.error('Error getting progress summary:', error)
    return res.status(500).json({ error: 'Failed to get progress summary' })
  }
}

async function updateMilestone(
  res: NextApiResponse, 
  userSupabase: any, 
  userId: string, 
  requestData: ProgressRequest
) {
  try {
    const { milestone_id, milestone_updates } = requestData

    if (!milestone_id || !milestone_updates) {
      return res.status(400).json({ error: 'Missing milestone_id or updates' })
    }

    const { data, error } = await userSupabase
      .from('career_milestones')
      .update(milestone_updates)
      .eq('id', milestone_id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update milestone' })
    }

    // Track the update as an activity
    await trackUserActivity(userSupabase, userId, 'milestone_updated', {
      milestone_id,
      updates: milestone_updates
    })

    return res.status(200).json({ success: true, milestone: data })

  } catch (error: any) {
    console.error('Error updating milestone:', error)
    return res.status(500).json({ error: 'Failed to update milestone' })
  }
}

async function trackActivity(
  res: NextApiResponse, 
  userSupabase: any, 
  userId: string, 
  requestData: ProgressRequest
) {
  try {
    const { activity_type, activity_data } = requestData

    if (!activity_type) {
      return res.status(400).json({ error: 'Missing activity_type' })
    }

    await trackUserActivity(userSupabase, userId, activity_type, activity_data)

    return res.status(200).json({ success: true })

  } catch (error: any) {
    console.error('Error tracking activity:', error)
    return res.status(500).json({ error: 'Failed to track activity' })
  }
}

async function trackUserActivity(
  userSupabase: any, 
  userId: string, 
  activityType: string, 
  activityData?: any
) {
  // Calculate points based on activity type
  const pointsMap: { [key: string]: number } = {
    'resume_updated': 10,
    'job_applied': 15,
    'job_saved': 5,
    'job_viewed': 2,
    'skill_learned': 20,
    'profile_updated': 8,
    'goal_set': 25,
    'milestone_completed': 50,
    'networking_activity': 12
  }

  const points = pointsMap[activityType] || 5

  await userSupabase
    .from('user_activities')
    .insert({
      user_id: userId,
      activity_type: activityType,
      activity_data: activityData || {},
      points_earned: points
    })
}

async function getBenchmarkData(userSupabase: any, careerObjectives: any) {
  const { data } = await userSupabase
    .from('career_benchmarks')
    .select('*')
    .eq('career_stage', careerObjectives.career_stage)
    .eq('target_role', careerObjectives.target_role)
    .single()

  return data
}

function calculateBenchmarkComparison(currentWeek: any, benchmark: any) {
  if (!benchmark) {
    return {
      your_performance: {
        applications_per_week: currentWeek.applications_count,
        response_rate: 0,
        interview_rate: 0
      },
      peer_average: {
        applications_per_week: 5,
        response_rate: 15,
        interview_rate: 8
      },
      performance_delta: {
        applications: -20,
        response_rate: -15,
        interview_rate: -8
      }
    }
  }

  return {
    your_performance: {
      applications_per_week: currentWeek.applications_count,
      response_rate: 0, // Would need to calculate from job interactions
      interview_rate: 0
    },
    peer_average: {
      applications_per_week: benchmark.avg_applications_per_week,
      response_rate: benchmark.avg_response_rate,
      interview_rate: benchmark.avg_interview_rate
    },
    performance_delta: {
      applications: ((currentWeek.applications_count - benchmark.avg_applications_per_week) / benchmark.avg_applications_per_week) * 100,
      response_rate: -15, // Placeholder
      interview_rate: -8 // Placeholder
    }
  }
}

async function generateWeeklyInsights(res: NextApiResponse, userSupabase: any, userId: string) {
  try {
    // This would be called by a cron job to generate AI insights for the week
    // For now, return success - will implement AI generation later
    return res.status(200).json({ success: true, message: 'Insights generated' })
  } catch (error: any) {
    console.error('Error generating insights:', error)
    return res.status(500).json({ error: 'Failed to generate insights' })
  }
}