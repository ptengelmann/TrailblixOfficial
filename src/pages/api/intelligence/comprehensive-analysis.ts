// Comprehensive AI Intelligence Analysis
// Generates personalized market intelligence, career predictions, and actionable insights
// Uses REAL user data from all sources

import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { UserSnapshot } from './user-snapshot'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ComprehensiveAnalysis {
  // Personalized Market Fit
  market_fit: {
    overall_score: number // 0-100
    readiness_level: 'ready' | 'almost_ready' | 'needs_prep' | 'early_stage'
    key_strengths: string[]
    improvement_areas: string[]
    estimated_timeline_to_goal: string
  }

  // Skill Gap Analysis
  skill_analysis: {
    current_skills: string[]
    target_role_skills: string[]
    skills_you_have: string[]
    skills_to_learn: Array<{
      skill: string
      priority: 'critical' | 'high' | 'medium' | 'nice_to_have'
      learning_time: string
      impact_on_salary: number
      resources: string[]
    }>
    skill_coverage_percentage: number
  }

  // Salary Intelligence
  salary_insights: {
    current_salary: number | null
    target_role_range: {
      min: number
      median: number
      max: number
      percentile_25: number
      percentile_75: number
    }
    your_position: string // e.g., "below market", "at market", "above market"
    potential_increase: {
      amount: number
      percentage: number
    }
    factors_affecting_salary: string[]
    negotiation_tips: string[]
  }

  // Career Trajectory
  career_path: {
    current_position: string
    target_position: string
    most_likely_next_role: string
    timeline_estimate: string
    probability_of_success: number
    key_requirements: string[]
    alternative_paths: Array<{
      role: string
      difficulty: 'easier' | 'similar' | 'harder'
      timeline: string
    }>
  }

  // Competitive Positioning
  competitive_analysis: {
    your_percentile: number // 0-100, where you rank vs peers
    vs_market_average: {
      resume_quality: string // "+15% above average"
      experience_level: string
      skill_breadth: string
      application_activity: string
    }
    competitive_advantages: string[]
    areas_to_improve: string[]
  }

  // Actionable Recommendations
  action_plan: {
    immediate_actions: Array<{
      action: string
      why: string
      impact: 'high' | 'medium' | 'low'
      effort: 'low' | 'medium' | 'high'
    }>
    this_week: string[]
    this_month: string[]
    next_3_months: string[]
  }

  // Job Market Intelligence
  market_conditions: {
    demand_for_target_role: 'very_high' | 'high' | 'moderate' | 'low'
    competition_level: 'very_competitive' | 'competitive' | 'moderate' | 'favorable'
    hiring_trend: 'increasing' | 'stable' | 'decreasing'
    best_locations: string[]
    salary_trends: string
    market_insights: string[]
  }

  confidence_score: number
  generated_at: string
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

    logger.info('Generating comprehensive AI analysis', 'API', { userId: user.id })

    // Fetch user data directly instead of calling another API
    const [
      profileResult,
      objectivesResult,
      resumesResult,
      jobInteractionsResult,
      milestonesResult,
      weeklyProgressResult,
      activitiesResult
    ] = await Promise.all([
      userSupabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
      userSupabase.from('career_objectives').select('*').eq('user_id', user.id).single(),
      userSupabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      userSupabase.from('job_interactions').select('*').eq('user_id', user.id),
      userSupabase.from('career_milestones').select('*').eq('user_id', user.id),
      userSupabase.from('weekly_progress').select('*').eq('user_id', user.id).order('week_start', { ascending: false }).limit(1),
      userSupabase.from('user_activities').select('*').eq('user_id', user.id)
    ])

    // Build snapshot
    const hasProfile = !!profileResult.data?.full_name
    const hasObjectives = !!objectivesResult.data
    const hasResume = resumesResult.data && resumesResult.data.length > 0

    const snapshot: UserSnapshot = {
      user_id: user.id,
      has_completed_setup: hasProfile && hasObjectives && hasResume,
      setup_completion_percentage: Math.round(([hasProfile, hasObjectives, hasResume].filter(Boolean).length / 3) * 100),
      profile: profileResult.data,
      objectives: objectivesResult.data,
      resume: {
        has_resume: hasResume,
        latest_score: resumesResult.data?.[0]?.score || null,
        analysis: resumesResult.data?.[0]?.ai_analysis as any,
        analyzed_at: resumesResult.data?.[0]?.created_at || null
      },
      job_activity: {
        total_viewed: jobInteractionsResult.data?.filter(j => j.interaction_type === 'viewed').length || 0,
        total_saved: jobInteractionsResult.data?.filter(j => j.interaction_type === 'saved').length || 0,
        total_applied: jobInteractionsResult.data?.filter(j => j.interaction_type === 'applied').length || 0,
        total_dismissed: jobInteractionsResult.data?.filter(j => j.interaction_type === 'dismissed').length || 0,
        last_application_date: null,
        avg_match_score: null
      },
      progress: {
        active_milestones: milestonesResult.data?.filter(m => m.status === 'active').length || 0,
        completed_milestones: milestonesResult.data?.filter(m => m.status === 'completed').length || 0,
        current_week_applications: weeklyProgressResult.data?.[0]?.applications_count || 0,
        current_week_momentum: weeklyProgressResult.data?.[0]?.momentum_score || 0,
        weekly_streak: 0,
        total_points: activitiesResult.data?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0
      },
      engagement: {
        days_since_signup: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        total_activities: activitiesResult.data?.length || 0,
        last_active: activitiesResult.data?.[0]?.created_at || null,
        engagement_level: activitiesResult.data && activitiesResult.data.length > 20 ? 'high' : activitiesResult.data && activitiesResult.data.length > 5 ? 'medium' : 'low'
      }
    }

    // Check if user has minimum required data
    if (!snapshot.has_completed_setup) {
      return res.status(400).json({
        error: 'incomplete_profile',
        message: 'Please complete your profile, set career objectives, and upload a resume before accessing intelligence insights.',
        completion_percentage: snapshot.setup_completion_percentage
      })
    }

    // Get market benchmarks for comparison
    const { data: benchmark } = await supabase
      .from('career_benchmarks')
      .select('*')
      .eq('career_stage', snapshot.objectives?.career_stage || 'mid')
      .eq('target_role', snapshot.objectives?.target_role || snapshot.profile?.current_role)
      .single()

    // Get skills intelligence for target role
    const { data: topSkills } = await supabase
      .from('skills_intelligence')
      .select('*')
      .order('demand_score', { ascending: false })
      .limit(20)

    // Fetch real salary data
    let salaryData = null
    try {
      const salaryResponse = await fetch(`http://localhost:3000/api/intelligence/salary-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: snapshot.objectives?.target_role || snapshot.profile?.current_role || 'Software Engineer',
          location: snapshot.profile?.location || 'United States',
          experience_level: snapshot.objectives?.career_stage || 'mid'
        })
      })
      if (salaryResponse.ok) {
        const salaryResult = await salaryResponse.json()
        salaryData = salaryResult.data
      }
    } catch (error) {
      logger.error('Failed to fetch salary data for analysis', 'API', { error: error.message })
    }

    // Generate AI analysis using Claude
    const analysis = await generateAIAnalysis(snapshot, benchmark, topSkills || [], salaryData)

    // Cache the analysis
    await supabase.from('career_intelligence_reports').insert({
      user_id: user.id,
      report_type: 'comprehensive_analysis',
      report_data: analysis
    })

    logger.info('Comprehensive analysis generated successfully', 'API', {
      userId: user.id,
      marketFitScore: analysis.market_fit.overall_score
    })

    return res.status(200).json({ success: true, analysis })

  } catch (error: any) {
    logger.error('Failed to generate comprehensive analysis', 'API', { error: error.message })
    return res.status(500).json({ error: 'Failed to generate analysis', details: error.message })
  }
}

async function generateAIAnalysis(
  snapshot: UserSnapshot,
  benchmark: any,
  topSkills: any[],
  salaryData: any
): Promise<ComprehensiveAnalysis> {

  const prompt = `You are an expert career advisor and data analyst. Generate a comprehensive, personalized career intelligence report for this user.

USER PROFILE:
- Current Role: ${snapshot.profile?.current_role || 'Not specified'}
- Years of Experience: ${snapshot.profile?.years_experience || 0}
- Location: ${snapshot.profile?.location || 'Not specified'}
- Education: ${snapshot.profile?.education_level || 'Not specified'}
- Current Salary: ${snapshot.profile?.current_salary ? `$${snapshot.profile.current_salary}` : 'Not disclosed'}

CAREER OBJECTIVES:
- Target Role: ${snapshot.objectives?.target_role || 'Not specified'}
- Industry: ${snapshot.objectives?.industry || 'Not specified'}
- Career Stage: ${snapshot.objectives?.career_stage || 'Not specified'}
- Timeline: ${snapshot.objectives?.timeline || 'Not specified'}
- Target Salary: ${snapshot.objectives?.target_salary ? `$${snapshot.objectives.target_salary}` : 'Not specified'}
- Work Preference: ${snapshot.objectives?.work_preference || 'Not specified'}

RESUME ANALYSIS:
- Resume Score: ${snapshot.resume.latest_score || 'Not scored'}/100
- Identified Skills: ${snapshot.resume.analysis?.skills_identified?.join(', ') || 'None identified'}
- Strengths: ${snapshot.resume.analysis?.strengths?.join(', ') || 'None noted'}
- Weaknesses: ${snapshot.resume.analysis?.weaknesses?.join(', ') || 'None noted'}
- Marketability Score: ${snapshot.resume.analysis?.marketability_score || 'Not calculated'}

JOB SEARCH ACTIVITY:
- Applications Submitted: ${snapshot.job_activity.total_applied}
- Jobs Saved: ${snapshot.job_activity.total_saved}
- Jobs Viewed: ${snapshot.job_activity.total_viewed}
- Last Application: ${snapshot.job_activity.last_application_date || 'Never'}
- Average Match Score: ${snapshot.job_activity.avg_match_score?.toFixed(1) || 'N/A'}

PROGRESS TRACKING:
- Active Milestones: ${snapshot.progress.active_milestones}
- Completed Milestones: ${snapshot.progress.completed_milestones}
- This Week Applications: ${snapshot.progress.current_week_applications}
- Weekly Streak: ${snapshot.progress.weekly_streak} weeks
- Momentum Score: ${snapshot.progress.current_week_momentum}

ENGAGEMENT:
- Days Since Signup: ${snapshot.engagement.days_since_signup}
- Total Activities: ${snapshot.engagement.total_activities}
- Engagement Level: ${snapshot.engagement.engagement_level}

MARKET BENCHMARKS (for ${snapshot.objectives?.target_role || snapshot.profile?.current_role}):
${benchmark ? `
- Expected Applications/Week: ${benchmark.avg_applications_per_week}
- Average Response Rate: ${benchmark.avg_response_rate}%
- Average Interview Rate: ${benchmark.avg_interview_rate}%
- Salary Range: $${benchmark.avg_salary_range_min} - $${benchmark.avg_salary_range_max}
- Average Time to Hire: ${benchmark.avg_time_to_hire_days} days
` : 'No benchmark data available'}

TOP IN-DEMAND SKILLS FOR THIS ROLE:
${topSkills.map(s => `- ${s.skill_name}: Demand Score ${s.demand_score}/100, ${s.growth_rate}% growth, +${s.salary_impact}% salary impact`).join('\n')}

REAL MARKET SALARY DATA:
${salaryData ? `
- Salary Range: $${salaryData.salary_range.min.toLocaleString()} - $${salaryData.salary_range.max.toLocaleString()}
- Median: $${salaryData.salary_range.median.toLocaleString()}
- 25th Percentile: $${salaryData.salary_range.percentile_25.toLocaleString()}
- 75th Percentile: $${salaryData.salary_range.percentile_75.toLocaleString()}
- Data Points: ${salaryData.data_points}
- Confidence: ${salaryData.confidence}
- Source: ${salaryData.source}
` : 'Salary data not available'}

GENERATE A COMPREHENSIVE ANALYSIS in JSON format with these exact fields:

{
  "market_fit": {
    "overall_score": <0-100>,
    "readiness_level": "ready|almost_ready|needs_prep|early_stage",
    "key_strengths": ["strength1", "strength2", "strength3"],
    "improvement_areas": ["area1", "area2", "area3"],
    "estimated_timeline_to_goal": "X months"
  },
  "skill_analysis": {
    "current_skills": ["skill1", "skill2"],
    "target_role_skills": ["skill1", "skill2"],
    "skills_you_have": ["skill1"],
    "skills_to_learn": [
      {
        "skill": "Skill Name",
        "priority": "critical|high|medium|nice_to_have",
        "learning_time": "X weeks/months",
        "impact_on_salary": 15,
        "resources": ["resource1", "resource2"]
      }
    ],
    "skill_coverage_percentage": <0-100>
  },
  "salary_insights": {
    "current_salary": ${snapshot.profile?.current_salary || 0},
    "target_role_range": {
      "min": <number>,
      "median": <number>,
      "max": <number>,
      "percentile_25": <number>,
      "percentile_75": <number>
    },
    "your_position": "below market|at market|above market",
    "potential_increase": {
      "amount": <number>,
      "percentage": <number>
    },
    "factors_affecting_salary": ["factor1", "factor2"],
    "negotiation_tips": ["tip1", "tip2"]
  },
  "career_path": {
    "current_position": "${snapshot.profile?.current_role}",
    "target_position": "${snapshot.objectives?.target_role}",
    "most_likely_next_role": "Role Name",
    "timeline_estimate": "X months",
    "probability_of_success": <0-100>,
    "key_requirements": ["req1", "req2"],
    "alternative_paths": [
      {"role": "Alternative Role", "difficulty": "easier|similar|harder", "timeline": "X months"}
    ]
  },
  "competitive_analysis": {
    "your_percentile": <0-100>,
    "vs_market_average": {
      "resume_quality": "+X% above/below average",
      "experience_level": "X% above/below average",
      "skill_breadth": "X% above/below average",
      "application_activity": "X% above/below average"
    },
    "competitive_advantages": ["advantage1", "advantage2"],
    "areas_to_improve": ["area1", "area2"]
  },
  "action_plan": {
    "immediate_actions": [
      {
        "action": "Action description",
        "why": "Reasoning",
        "impact": "high|medium|low",
        "effort": "low|medium|high"
      }
    ],
    "this_week": ["action1", "action2", "action3"],
    "this_month": ["action1", "action2"],
    "next_3_months": ["action1", "action2"]
  },
  "market_conditions": {
    "demand_for_target_role": "very_high|high|moderate|low",
    "competition_level": "very_competitive|competitive|moderate|favorable",
    "hiring_trend": "increasing|stable|decreasing",
    "best_locations": ["location1", "location2"],
    "salary_trends": "Description of salary trends",
    "market_insights": ["insight1", "insight2", "insight3"]
  },
  "confidence_score": <0-100>,
  "generated_at": "${new Date().toISOString()}"
}

IMPORTANT:
- Be specific and actionable
- Use REAL data from the user snapshot
- Compare to benchmarks where available
- Provide honest assessment of readiness
- Give concrete next steps
- Return ONLY valid JSON, no markdown formatting`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = message.content[0]
  if (content.type === 'text') {
    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      return analysis as ComprehensiveAnalysis
    }
  }

  throw new Error('Failed to parse AI response')
}
