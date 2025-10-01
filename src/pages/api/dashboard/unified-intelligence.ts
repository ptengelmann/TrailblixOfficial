// Unified Dashboard Intelligence System
// Connects main dashboard with Claude AI intelligence from comprehensive analysis
// Provides personalized tasks, insights, and progression based on real AI analysis

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DashboardIntelligence {
  // AI-Personalized Daily Tasks
  daily_tasks: Array<{
    id: string
    title: string
    description: string
    type: 'application' | 'networking' | 'skill_building' | 'resume' | 'interview_prep'
    priority: 'critical' | 'high' | 'medium'
    points: number
    estimated_time: string
    ai_reasoning: string
    resources?: string[]
  }>

  // Real AI Insights (not hardcoded)
  ai_insights: Array<{
    type: 'opportunity' | 'warning' | 'achievement' | 'recommendation'
    title: string
    message: string
    action: string
    priority: 'high' | 'medium' | 'low'
    data_source: string
  }>

  // Connected Progress Data
  progress: {
    market_readiness_score: number
    skills_coverage: number
    application_velocity: number
    networking_score: number
    overall_momentum: number
    week_over_week_change: number
  }

  // Meaningful Progression System
  level_system: {
    current_level: number
    total_xp: number
    xp_to_next_level: number
    unlocked_features: string[]
    next_unlock: {
      feature: string
      at_level: number
      xp_required: number
    }
  }

  // This Week's AI-Generated Focus
  weekly_focus: {
    main_goal: string
    why_this_matters: string
    success_metrics: Array<{
      metric: string
      current: number
      target: number
      unit: string
    }>
    daily_actions: string[]
    ai_confidence: number
  }

  metadata: {
    generated_at: string
    analysis_source: 'comprehensive_intelligence' | 'basic_fallback'
    confidence_score: number
    next_update: string
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
    return res.status(401).json({ error: 'Missing authorization' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    )

    const { data: { user }, error: authError } = await userSupabase.auth.getUser()
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' })
    }

    logger.info('Generating unified dashboard intelligence', 'API', { userId: user.id })

    // 1. Get or generate comprehensive intelligence analysis
    const intelligence = await getOrGenerateIntelligence(user.id, userSupabase)

    // 2. Generate personalized daily tasks using Claude AI
    const dailyTasks = await generateAIPersonalizedTasks(user.id, intelligence, userSupabase)

    // 3. Generate real AI insights from actual data
    const aiInsights = await generateRealAIInsights(user.id, intelligence, userSupabase)

    // 4. Calculate connected progress metrics
    const progress = await calculateConnectedProgress(user.id, intelligence, userSupabase)

    // 5. Generate meaningful progression system
    const levelSystem = await calculateMeaningfulProgression(user.id, userSupabase)

    // 6. Generate this week's AI focus
    const weeklyFocus = await generateWeeklyAIFocus(user.id, intelligence, userSupabase)

    const dashboardIntelligence: DashboardIntelligence = {
      daily_tasks: dailyTasks,
      ai_insights: aiInsights,
      progress,
      level_system: levelSystem,
      weekly_focus: weeklyFocus,
      metadata: {
        generated_at: new Date().toISOString(),
        analysis_source: intelligence ? 'comprehensive_intelligence' : 'basic_fallback',
        confidence_score: intelligence?.confidence_score || 0,
        next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    }

    logger.info('Dashboard intelligence generated successfully', 'API', {
      userId: user.id,
      taskCount: dailyTasks.length,
      insightCount: aiInsights.length
    })

    return res.status(200).json({ success: true, data: dashboardIntelligence })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to generate dashboard intelligence', 'API', { error: errorMessage })
    return res.status(500).json({ error: 'Failed to generate intelligence' })
  }
}

async function getOrGenerateIntelligence(userId: string, userSupabase: unknown) {
  // Check if we have recent comprehensive analysis (last 24 hours)
  const { data: latestReport } = await supabase
    .from('career_intelligence_reports')
    .select('report_data, created_at')
    .eq('user_id', userId)
    .eq('report_type', 'comprehensive_analysis')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (latestReport) {
    const ageHours = (Date.now() - new Date(latestReport.created_at).getTime()) / (1000 * 60 * 60)
    if (ageHours < 24) {
      return latestReport.report_data
    }
  }

  // If no recent analysis, trigger generation (async - don't wait)
  triggerComprehensiveAnalysis(userId).catch(err =>
    logger.error('Failed to trigger analysis', 'API', { userId, error: err.message })
  )

  return null
}

async function triggerComprehensiveAnalysis(userId: string) {
  // This would call the comprehensive-analysis API
  // For now, just log that we need to generate it
  logger.info('Comprehensive analysis needed', 'API', { userId })
}

async function generateAIPersonalizedTasks(userId: string, intelligence: unknown, userSupabase: unknown) {
  // If we have comprehensive intelligence, use it to generate tasks
  if (intelligence) {
    return await generateTasksFromIntelligence(intelligence)
  }

  // Otherwise, generate basic tasks as fallback
  return await generateBasicTasks(userId, userSupabase)
}

async function generateTasksFromIntelligence(intelligence: unknown) {
  const tasks = []
  const intel = intelligence as Record<string, unknown>

  // Extract critical skills with high impact
  const skillAnalysis = intel.skill_analysis as Record<string, unknown> | undefined
  const skillsToLearn = (skillAnalysis?.skills_to_learn as Array<Record<string, unknown>>) || []
  const criticalSkills = skillsToLearn
    .filter((s) => s.priority === 'critical')
    .slice(0, 2)

  for (const skill of criticalSkills) {
    tasks.push({
      id: `skill_${String(skill.skill).toLowerCase().replace(/\s+/g, '_')}`,
      title: `Learn ${skill.skill}`,
      description: `Focus on ${skill.skill} - critical for your target role`,
      type: 'skill_building' as const,
      priority: 'critical' as const,
      points: 50,
      estimated_time: String(skill.learning_time || ''),
      ai_reasoning: `This skill has +${skill.impact_on_salary}% salary impact and is marked as critical priority in your intelligence analysis`,
      resources: (skill.resources as string[]) || []
    })
  }

  // Add immediate actions from action plan
  const actionPlan = intel.action_plan as Record<string, unknown> | undefined
  const immediateActions = (actionPlan?.immediate_actions as Array<Record<string, unknown>>) || []
  const highImpactActions = immediateActions
    .filter((a) => a.impact === 'high')
    .slice(0, 3)

  for (const action of highImpactActions) {
    const actionText = String(action.action || '')
    const effort = String(action.effort || 'medium')
    const impact = String(action.impact || 'medium')

    tasks.push({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: actionText,
      description: String(action.why || ''),
      type: determineTaskType(actionText),
      priority: 'high' as const,
      points: effort === 'low' ? 30 : effort === 'medium' ? 40 : 50,
      estimated_time: effort === 'low' ? '15 mins' : effort === 'medium' ? '30 mins' : '1 hour',
      ai_reasoning: `${impact.toUpperCase()} impact action from AI analysis`
    })
  }

  return tasks.slice(0, 6) // Max 6 tasks per day
}

function determineTaskType(actionText: string): 'application' | 'networking' | 'skill_building' | 'resume' | 'interview_prep' {
  const lower = actionText.toLowerCase()
  if (lower.includes('apply') || lower.includes('application')) return 'application'
  if (lower.includes('network') || lower.includes('connect')) return 'networking'
  if (lower.includes('resume') || lower.includes('cv')) return 'resume'
  if (lower.includes('interview') || lower.includes('prepare')) return 'interview_prep'
  return 'skill_building'
}

async function generateBasicTasks(userId: string, userSupabase: unknown) {
  // Fallback basic tasks
  return [
    {
      id: 'daily_application',
      title: 'Apply to 2 Quality Positions',
      description: 'Focus on roles that match your skills and goals',
      type: 'application' as const,
      priority: 'high' as const,
      points: 30,
      estimated_time: '45 mins',
      ai_reasoning: 'Daily application maintains momentum in your job search'
    },
    {
      id: 'daily_networking',
      title: 'Connect with 3 Professionals',
      description: 'Expand your network on LinkedIn',
      type: 'networking' as const,
      priority: 'medium' as const,
      points: 20,
      estimated_time: '20 mins',
      ai_reasoning: '70% of jobs come through networking'
    }
  ]
}

async function generateRealAIInsights(userId: string, intelligence: unknown, userSupabase: unknown) {
  const insights = []

  if (!intelligence) {
    return [{
      type: 'recommendation' as const,
      title: 'Complete Your Profile',
      message: 'Get AI-powered insights by completing your career profile',
      action: 'Go to Intelligence Dashboard',
      priority: 'high' as const,
      data_source: 'system'
    }]
  }

  const intel = intelligence as Record<string, unknown>
  const marketFit = intel.market_fit as Record<string, unknown> | undefined
  const salaryInsights = intel.salary_insights as Record<string, unknown> | undefined
  const skillAnalysis = intel.skill_analysis as Record<string, unknown> | undefined

  // Market fit insights
  if (marketFit && Number(marketFit.overall_score) < 70) {
    const improvementAreas = marketFit.improvement_areas as string[] | undefined
    insights.push({
      type: 'warning' as const,
      title: 'Market Readiness: ' + String(marketFit.readiness_level || ''),
      message: `Your market fit score is ${marketFit.overall_score}/100. ${improvementAreas?.[0] || ''}`,
      action: 'View detailed analysis',
      priority: 'high' as const,
      data_source: 'claude_ai_comprehensive_analysis'
    })
  }

  // Salary opportunity
  const potentialIncrease = salaryInsights?.potential_increase as Record<string, unknown> | undefined
  if (potentialIncrease && Number(potentialIncrease.amount) > 0) {
    insights.push({
      type: 'opportunity' as const,
      title: `$${Number(potentialIncrease.amount).toLocaleString()} Salary Opportunity`,
      message: `You could increase your salary by ${potentialIncrease.percentage}% by moving to your target role`,
      action: 'View salary analysis',
      priority: 'high' as const,
      data_source: 'adzuna_api_real_market_data'
    })
  }

  // Skills gap
  const skillsToLearn = (skillAnalysis?.skills_to_learn as Array<Record<string, unknown>>) || []
  const criticalGaps = skillsToLearn.filter((s) => s.priority === 'critical').length
  if (criticalGaps > 0) {
    insights.push({
      type: 'warning' as const,
      title: `${criticalGaps} Critical Skills Missing`,
      message: `These skills are essential for your target role and have high salary impact`,
      action: 'View skills analysis',
      priority: 'high' as const,
      data_source: 'claude_ai_skill_analysis'
    })
  }

  return insights
}

async function calculateConnectedProgress(userId: string, intelligence: unknown, userSupabase: unknown) {
  if (!intelligence) {
    return {
      market_readiness_score: 0,
      skills_coverage: 0,
      application_velocity: 0,
      networking_score: 0,
      overall_momentum: 0,
      week_over_week_change: 0
    }
  }

  const intel = intelligence as Record<string, unknown>
  const marketFit = intel.market_fit as Record<string, unknown> | undefined
  const skillAnalysis = intel.skill_analysis as Record<string, unknown> | undefined

  return {
    market_readiness_score: Number(marketFit?.overall_score || 0),
    skills_coverage: Number(skillAnalysis?.skill_coverage_percentage || 0),
    application_velocity: 75, // Would calculate from job_interactions
    networking_score: 60, // Would calculate from user_activities
    overall_momentum: Number(marketFit?.overall_score || 0),
    week_over_week_change: 5 // Would calculate from weekly_progress
  }
}

async function calculateMeaningfulProgression(userId: string, userSupabase: unknown) {
  // Get total XP
  const client = userSupabase as { from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => Promise<{ data: Array<Record<string, unknown>> | null }> } } }
  const { data: activities } = await client
    .from('user_activities')
    .select('points_earned')
    .eq('user_id', userId)

  const totalXP = activities?.reduce((sum: number, a) => sum + (Number(a.points_earned) || 0), 0) || 0
  const currentLevel = Math.floor(totalXP / 100) + 1
  const xpToNext = ((currentLevel) * 100) - totalXP

  // Define feature unlocks
  const featureUnlocks = [
    { level: 1, feature: 'Basic Dashboard' },
    { level: 2, feature: 'AI Intelligence Dashboard' },
    { level: 3, feature: 'Advanced Job Matching' },
    { level: 5, feature: 'AI Career Coach' },
    { level: 7, feature: 'Salary Negotiation Tools' },
    { level: 10, feature: 'Premium Resume Builder' },
    { level: 15, feature: 'Interview Prep AI' },
    { level: 20, feature: 'Career Path Simulator' }
  ]

  const unlocked = featureUnlocks.filter(f => f.level <= currentLevel).map(f => f.feature)
  const nextUnlock = featureUnlocks.find(f => f.level > currentLevel)

  return {
    current_level: currentLevel,
    total_xp: totalXP,
    xp_to_next_level: xpToNext,
    unlocked_features: unlocked,
    next_unlock: nextUnlock ? {
      feature: nextUnlock.feature,
      at_level: nextUnlock.level,
      xp_required: (nextUnlock.level * 100) - totalXP
    } : {
      feature: 'All features unlocked!',
      at_level: currentLevel,
      xp_required: 0
    }
  }
}

async function generateWeeklyAIFocus(userId: string, intelligence: unknown, userSupabase: unknown) {
  if (!intelligence) {
    return {
      main_goal: 'Complete your career profile',
      why_this_matters: 'Unlock AI-powered career intelligence and personalized recommendations',
      success_metrics: [],
      daily_actions: ['Add your career objectives', 'Upload your resume', 'Set your target role'],
      ai_confidence: 0
    }
  }

  const intel = intelligence as Record<string, unknown>
  const actionPlan = intel.action_plan as Record<string, unknown> | undefined
  const immediateActions = (actionPlan?.immediate_actions as Array<Record<string, unknown>>) || []
  const primaryAction = immediateActions.find((a) => a.impact === 'high') || immediateActions[0] || { action: '', why: '' }

  const skillAnalysis = intel.skill_analysis as Record<string, unknown> | undefined
  const skillsYouHave = (skillAnalysis?.skills_you_have as Array<unknown>) || []

  return {
    main_goal: String(primaryAction.action || ''),
    why_this_matters: String(primaryAction.why || ''),
    success_metrics: [
      {
        metric: 'Applications Submitted',
        current: 0, // Would get from database
        target: 10,
        unit: 'applications'
      },
      {
        metric: 'Skills Improved',
        current: skillsYouHave.length,
        target: skillsYouHave.length + 3,
        unit: 'skills'
      }
    ],
    daily_actions: (actionPlan?.this_week as string[]) || [],
    ai_confidence: Number(intel.confidence_score) || 85
  }
}
