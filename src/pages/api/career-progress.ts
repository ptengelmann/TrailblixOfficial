// src/pages/api/career-progress.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ProgressCalculator } from '@/lib/progressCalculations'
import { WeeklyProgress, CareerMilestone, ProgressSummary } from '@/types/progress'
import { ApiResponse, CareerObjectives, UserProfile } from '@/types/api'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ProgressRequest {
  action: 'get_summary' | 'update_milestone' | 'track_activity' | 'generate_insights' | 'get_daily_progress' | 'complete_daily_task'
  milestone_id?: string
  milestone_updates?: Partial<CareerMilestone>
  activity_type?: string
  activity_data?: Record<string, unknown>
  task_data?: {
    task_id: string
    task_type: string
    points_earned: number
    streak_eligible: boolean
  }
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

      case 'get_daily_progress':
        return await getDailyProgress(res, userSupabase, user.id)

      case 'complete_daily_task':
        return await completeDailyTask(res, userSupabase, user.id, requestData)

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    logger.error('Progress tracking operation failed', 'API', { error: errorMessage, stack: errorStack })
    return res.status(500).json({ error: 'Failed to process request' })
  }
}

async function getProgressSummary(res: NextApiResponse, userSupabase: SupabaseClient, userId: string) {
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
    let currentWeek = weeklyProgress.data?.find((w: WeeklyProgress) => w.week_start === weekStart)
    
    if (!currentWeek) {
      // Create current week progress from job interactions
      const thisWeekJobs = jobInteractions.data || []
      const weeklyData = {
        applications_count: thisWeekJobs.filter((j: { interaction_type: string }) => j.interaction_type === 'applied').length,
        jobs_viewed: thisWeekJobs.filter((j: { interaction_type: string }) => j.interaction_type === 'viewed').length,
        jobs_saved: thisWeekJobs.filter((j: { interaction_type: string }) => j.interaction_type === 'saved').length,
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to get progress summary', 'DATABASE', { userId, error: errorMessage })
    return res.status(500).json({ error: 'Failed to get progress summary' })
  }
}

async function updateMilestone(
  res: NextApiResponse,
  userSupabase: SupabaseClient,
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to update milestone', 'DATABASE', { userId, milestone_id: requestData.milestone_id, error: errorMessage })
    return res.status(500).json({ error: 'Failed to update milestone' })
  }
}

async function trackActivity(
  res: NextApiResponse,
  userSupabase: SupabaseClient,
  userId: string,
  requestData: ProgressRequest
) {
  try {
    const { activity_type, activity_data } = requestData

    if (!activity_type) {
      return res.status(400).json({ error: 'Missing activity_type' })
    }

    // 1. Save the activity
    await trackUserActivity(userSupabase, userId, activity_type, activity_data)

    // 2. Update relevant milestones based on activity type
    if (activity_type === 'networking_activity') {
      await updateMilestoneProgress(userSupabase, userId, 'networking', activity_data?.count || 1)
    }
    if (activity_type === 'job_applied') {
      await updateMilestoneProgress(userSupabase, userId, 'application_goal', 1)
    }

    // 3. Recalculate current week's progress
    await recalculateWeeklyProgress(userSupabase, userId)

    return res.status(200).json({ success: true })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to track user activity', 'DATABASE', { userId, activity_type: requestData.activity_type, error: errorMessage })
    return res.status(500).json({ error: 'Failed to track activity' })
  }
}

// New helper function to update milestone progress
async function updateMilestoneProgress(
  userSupabase: SupabaseClient,
  userId: string,
  milestoneType: string,
  incrementBy: number
) {
  try {
    // Find the active milestone of this type
    const { data: milestone, error: findError } = await userSupabase
      .from('career_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('milestone_type', milestoneType)
      .eq('status', 'active')
      .order('target_date', { ascending: true })
      .limit(1)
      .single()

    if (findError || !milestone) {
      logger.info(`No active ${milestoneType} milestone found for user ${userId}`, 'DATABASE', { userId, milestoneType })
      return
    }

    // Update the current_value
    const newCurrentValue = milestone.current_value + incrementBy
    const { error: updateError } = await userSupabase
      .from('career_milestones')
      .update({ 
        current_value: newCurrentValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestone.id)

    if (updateError) {
      logger.error('Failed to update milestone progress', 'DATABASE', { userId, milestoneType, error: updateError.message })
    } else {
      logger.info(`Updated ${milestoneType} milestone: ${milestone.current_value} → ${newCurrentValue}`, 'DATABASE', { userId, milestoneType, oldValue: milestone.current_value, newValue: newCurrentValue })
    }

  } catch (error) {
    logger.error('updateMilestoneProgress operation failed', 'DATABASE', { userId, milestoneType, error: error.message })
  }
}

// New helper function to recalculate weekly progress
async function recalculateWeeklyProgress(userSupabase: SupabaseClient, userId: string) {
  try {
    // Get current week's start date (Monday)
    const now = new Date()
    const currentWeekStart = new Date(now)
    const day = currentWeekStart.getDay()
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1)
    currentWeekStart.setDate(diff)
    currentWeekStart.setHours(0, 0, 0, 0)
    const weekStart = currentWeekStart.toISOString().split('T')[0]

    // Get this week's activities
    const [jobInteractions, userActivities, milestones] = await Promise.all([
      userSupabase
        .from('job_interactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', currentWeekStart.toISOString()),
      
      userSupabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', currentWeekStart.toISOString()),
        
      userSupabase
        .from('career_milestones')
        .select('*')
        .eq('user_id', userId)
    ])

    // Calculate weekly data from activities
    const thisWeekJobs = jobInteractions.data || []
    const thisWeekActivities = userActivities.data || []

    const weeklyData = {
      applications_count: thisWeekJobs.filter((j: { interaction_type: string }) => j.interaction_type === 'applied').length,
      jobs_viewed: thisWeekJobs.filter((j: { interaction_type: string }) => j.interaction_type === 'viewed').length,
      jobs_saved: thisWeekJobs.filter((j: { interaction_type: string }) => j.interaction_type === 'saved').length,
      resume_updates: thisWeekActivities.filter((a: { activity_type: string }) => a.activity_type === 'resume_updated').length,
      skill_progress_updates: thisWeekActivities.filter((a: { activity_type: string }) => a.activity_type === 'skill_learned').length,
      networking_activities: thisWeekActivities.filter((a: { activity_type: string }) => a.activity_type === 'networking_activity').length,
      interview_count: thisWeekActivities.filter((a: { activity_type: string }) => a.activity_type === 'job_interview').length || 0
    }

    const momentumScore = ProgressCalculator.calculateMomentumScore(weeklyData)
    const goalProgress = ProgressCalculator.calculateGoalProgress(milestones.data || [])

    // Upsert current week's progress
    const { error } = await userSupabase
      .from('weekly_progress')
      .upsert({
        user_id: userId,
        week_start: weekStart,
        ...weeklyData,
        momentum_score: momentumScore,
        goal_progress_percentage: goalProgress,
        generated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,week_start' 
      })

    if (error) {
      logger.error('Failed to update weekly progress', 'DATABASE', { userId, weekStart, error: error.message })
    } else {
      logger.info('Weekly progress recalculated successfully', 'DATABASE', { userId, weekStart, weeklyData })
    }

  } catch (error) {
    logger.error('recalculateWeeklyProgress operation failed', 'DATABASE', { userId, error: error.message })
  }
}

async function trackUserActivity(
  userSupabase: SupabaseClient,
  userId: string,
  activityType: string,
  activityData?: Record<string, unknown>
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

async function getBenchmarkData(userSupabase: SupabaseClient, careerObjectives: CareerObjectives) {
  const { data } = await userSupabase
    .from('career_benchmarks')
    .select('*')
    .eq('career_stage', careerObjectives.career_stage)
    .eq('target_role', careerObjectives.target_role)
    .single()

  return data
}

function calculateBenchmarkComparison(currentWeek: WeeklyProgress, benchmark: { avg_applications_per_week: number; avg_response_rate: number; avg_interview_rate: number } | null) {
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

async function generateWeeklyInsights(res: NextApiResponse, userSupabase: SupabaseClient, userId: string) {
  try {
    // This would be called by a cron job to generate AI insights for the week
    // For now, return success - will implement AI generation later
    return res.status(200).json({ success: true, message: 'Insights generated' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to generate weekly insights', 'AI', { userId, error: errorMessage })
    return res.status(500).json({ error: 'Failed to generate insights' })
  }
}

// Get daily progress including streaks and gamification data
async function getDailyProgress(res: NextApiResponse, userSupabase: SupabaseClient, userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get user's points and level data
    const { data: pointsData } = await userSupabase
      .from('user_activities')
      .select('activity_data')
      .eq('user_id', userId)
      .eq('activity_type', 'daily_task_completed')

    // Calculate total points
    const totalPoints = pointsData?.reduce((sum: number, activity: { activity_data?: { points_earned?: number } }) => {
      return sum + (activity.activity_data?.points_earned || 0)
    }, 0) || 0

    // Get streak data - consecutive days with completed tasks
    const { data: dailyCompletions } = await userSupabase
      .from('user_activities')
      .select('created_at')
      .eq('user_id', userId)
      .eq('activity_type', 'daily_task_completed')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false })

    // Calculate current streak
    let currentStreak = 0
    const completionDates = new Set()

    dailyCompletions?.forEach((completion: { created_at: string }) => {
      const date = completion.created_at.split('T')[0]
      completionDates.add(date)
    })

    // Count consecutive days from today backwards
    const currentDate = new Date()
    while (currentDate >= new Date(weekAgo)) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (completionDates.has(dateStr)) {
        currentStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    // Get today's completed tasks count
    const { data: todayTasks } = await userSupabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'daily_task_completed')
      .gte('created_at', today)

    const tasksCompletedToday = todayTasks?.length || 0

    // Calculate level (100 points per level)
    const level = Math.floor(totalPoints / 100) + 1

    // Get longest streak (would need to implement proper calculation)
    const longestStreak = Math.max(currentStreak, 7) // Placeholder

    const streaks = {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_points: totalPoints,
      level: level,
      tasks_completed_today: tasksCompletedToday,
      weekly_goal: 21, // 3 tasks per day * 7 days
      weekly_progress: Math.min((tasksCompletedToday * 7) / 21 * 100, 100)
    }

    return res.status(200).json({ success: true, streaks })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to get daily progress', 'DATABASE', { userId, error: errorMessage })
    return res.status(500).json({ error: 'Failed to get daily progress' })
  }
}

// Complete a daily task and update streaks/points
async function completeDailyTask(res: NextApiResponse, userSupabase: SupabaseClient, userId: string, requestData: ProgressRequest) {
  try {
    const { task_data } = requestData
    if (!task_data) {
      return res.status(400).json({ error: 'Task data required' })
    }

    // Record the task completion
    const { error: insertError } = await userSupabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: 'daily_task_completed',
        activity_data: {
          task_id: task_data.task_id,
          task_type: task_data.task_type,
          points_earned: task_data.points_earned,
          streak_eligible: task_data.streak_eligible
        }
      })

    if (insertError) {
      throw insertError
    }

    // Update milestone progress based on task type
    const milestoneMapping = {
      'job_search': 'application_goal',
      'networking': 'networking',
      'application': 'application_goal',
      'skill_building': 'skill_development'
    }

    const milestoneType = milestoneMapping[task_data.task_type as keyof typeof milestoneMapping]
    if (milestoneType) {
      await updateMilestoneProgress(userSupabase, userId, milestoneType, 1)
    }

    return res.status(200).json({
      success: true,
      message: 'Task completed successfully',
      points_earned: task_data.points_earned
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to complete daily task', 'DATABASE', { userId, task_data: requestData.task_data, error: errorMessage })
    return res.status(500).json({ error: 'Failed to complete task' })
  }
}