// src/pages/api/jobs/interactions.ts
// Fixed version with proper RLS handling

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { JobInteraction, UserProfile, CareerObjectives } from '@/types/api'
import { logger } from '@/lib/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface JobInteractionRequest {
  action: 'create' | 'update' | 'delete' | 'list'
  job_id?: string
  job_data?: Record<string, unknown>
  interaction_type?: 'viewed' | 'saved' | 'applied' | 'dismissed'
  notes?: string
  generate_ai_analysis?: boolean
  limit?: number
  offset?: number
  include_ai_analysis?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get the session token from the Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    // Create a user-scoped Supabase client with the session token
    // This ensures RLS policies are properly enforced
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

    // Verify the user and get their ID
    const { data: { user }, error: authError } = await userSupabase.auth.getUser()
    if (authError || !user) {
      logger.error('Authentication failed in job interactions API', 'AUTH', { error: authError?.message })
      return res.status(401).json({ error: 'Invalid authentication' })
    }

    const requestData = req.body as JobInteractionRequest
    const { action } = requestData

    logger.info(`Job interactions API called with action: ${action} by user: ${user.id}`, 'API', { action, userId: user.id })

    switch (action) {
      case 'create':
        return await createInteraction(res, userSupabase, user.id, requestData)
      
      case 'update':
        return await updateInteraction(res, userSupabase, user.id, requestData)
      
      case 'delete':
        return await deleteInteraction(res, userSupabase, user.id, requestData)
      
      case 'list':
        return await listInteractions(res, userSupabase, user.id, requestData)
      
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    logger.error('Job interaction handler failed', 'API', { error: errorMessage, stack: errorStack })
    return res.status(500).json({
      error: 'Failed to process job interaction',
      details: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
    })
  }
}

async function createInteraction(
  res: NextApiResponse,
  userSupabase: SupabaseClient, // User-scoped Supabase client
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    const { job_id, job_data, interaction_type, notes, generate_ai_analysis } = requestData

    if (!job_id || !job_data || !interaction_type) {
      return res.status(400).json({ error: 'Missing required fields: job_id, job_data, interaction_type' })
    }

    logger.info(`Creating ${interaction_type} interaction for job ${job_id}`, 'DATABASE', { userId, job_id, interaction_type })

    // Check if interaction already exists (using user-scoped client)
    const { data: existing, error: checkError } = await userSupabase
      .from('job_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', job_id)
      .eq('interaction_type', interaction_type)
      .maybeSingle()

    if (checkError) {
      logger.error('Failed to check existing interaction', 'DATABASE', { userId, job_id, error: checkError.message })
      return res.status(500).json({ error: 'Database error checking existing interaction' })
    }

    if (existing) {
      return res.status(400).json({ error: 'Interaction already exists' })
    }

    let aiMatchScore = null
    let matchAnalysis = null

    // Generate AI analysis if requested and it's a save action
    if (generate_ai_analysis && interaction_type === 'saved') {
      try {
        const userContext = await getUserContext(userSupabase, userId)
        if (userContext.objectives) {
          const analysis = await generateJobMatchAnalysis(job_data, userContext)
          aiMatchScore = analysis.match_score
          matchAnalysis = analysis.analysis
        }
      } catch (error) {
        logger.error('AI job analysis failed', 'AI', { userId, job_id, error: error.message })
        // Continue without AI analysis
      }
    }

    // Create the interaction (using user-scoped client)
    const { data, error } = await userSupabase
      .from('job_interactions')
      .insert({
        user_id: userId,
        job_id: job_id,
        job_data: job_data,
        interaction_type: interaction_type,
        notes: notes || null,
        ai_match_score: aiMatchScore,
        match_analysis: matchAnalysis
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create job interaction', 'DATABASE', { userId, job_id, interaction_type, error: error.message })
      return res.status(500).json({ error: 'Failed to create interaction', details: error.message })
    }

    return res.status(201).json({
      success: true,
      interaction: data,
      ai_analysis: matchAnalysis ? {
        match_score: aiMatchScore,
        analysis: matchAnalysis
      } : null
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Create interaction operation failed', 'API', { userId, error: errorMessage })
    return res.status(500).json({
      error: 'Failed to create interaction',
      details: errorMessage
    })
  }
}

async function updateInteraction(
  res: NextApiResponse,
  userSupabase: SupabaseClient,
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    const { job_id, interaction_type, notes } = requestData

    if (!job_id) {
      return res.status(400).json({ error: 'Missing required field: job_id' })
    }

    const updateData: Partial<JobInteraction> = {}
    if (interaction_type) updateData.interaction_type = interaction_type
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await userSupabase
      .from('job_interactions')
      .update(updateData)
      .eq('user_id', userId)
      .eq('job_id', job_id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update job interaction', 'DATABASE', { userId, job_id, error: error.message })
      return res.status(500).json({ error: 'Failed to update interaction', details: error.message })
    }

    return res.status(200).json({
      success: true,
      interaction: data
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Update interaction operation failed', 'API', { userId, error: errorMessage })
    return res.status(500).json({
      error: 'Failed to update interaction',
      details: errorMessage
    })
  }
}

async function deleteInteraction(
  res: NextApiResponse,
  userSupabase: SupabaseClient,
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    const { job_id, interaction_type } = requestData

    if (!job_id) {
      return res.status(400).json({ error: 'Missing required field: job_id' })
    }

    let query = userSupabase
      .from('job_interactions')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', job_id)

    if (interaction_type) {
      query = query.eq('interaction_type', interaction_type)
    }

    const { error } = await query

    if (error) {
      logger.error('Failed to delete job interaction', 'DATABASE', { userId, job_id, error: error.message })
      return res.status(500).json({ error: 'Failed to delete interaction', details: error.message })
    }

    return res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully'
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Delete interaction operation failed', 'API', { userId, error: errorMessage })
    return res.status(500).json({
      error: 'Failed to delete interaction',
      details: errorMessage
    })
  }
}

async function listInteractions(
  res: NextApiResponse,
  userSupabase: SupabaseClient,
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    logger.info(`Listing interactions for user: ${userId}`, 'DATABASE', { userId, params: { interaction_type, limit, offset, include_ai_analysis } })

    const { 
      interaction_type,
      limit = 20,
      offset = 0,
      include_ai_analysis = false
    } = requestData

    // Build the select query
    let selectFields = `
      id,
      job_id,
      job_data,
      interaction_type,
      notes,
      created_at,
      updated_at
    `

    if (include_ai_analysis === true) {
      selectFields += `, ai_match_score, match_analysis`
    }

    let query = userSupabase
      .from('job_interactions')
      .select(selectFields.trim())
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit && offset !== undefined) {
      const limitNum = parseInt(limit.toString())
      const offsetNum = parseInt(offset.toString())
      query = query.range(offsetNum, offsetNum + limitNum - 1)
    }

    if (interaction_type) {
      query = query.eq('interaction_type', interaction_type)
    }

    logger.debug('Executing query for job interactions', 'DATABASE')
    const { data: interactions, error, count } = await query

    if (error) {
      logger.error('Failed to fetch job interactions', 'DATABASE', { userId, error: error.message })
      return res.status(500).json({ error: 'Failed to fetch interactions', details: error.message })
    }

    logger.info(`Found ${interactions?.length || 0} job interactions`, 'DATABASE', { userId, count: interactions?.length || 0 })

    // Get summary stats
    logger.debug('Fetching interaction summary stats', 'DATABASE', { userId })
    const { data: stats, error: statsError } = await userSupabase
      .from('job_interactions')
      .select('interaction_type')
      .eq('user_id', userId)

    if (statsError) {
      logger.error('Failed to fetch interaction stats', 'DATABASE', { userId, error: statsError.message })
      // Continue without stats rather than failing
    }

    const summary = {
      total_interactions: stats?.length || 0,
      saved_jobs: stats?.filter((s: { interaction_type: string }) => s.interaction_type === 'saved').length || 0,
      applied_jobs: stats?.filter((s: { interaction_type: string }) => s.interaction_type === 'applied').length || 0,
      viewed_jobs: stats?.filter((s: { interaction_type: string }) => s.interaction_type === 'viewed').length || 0,
      dismissed_jobs: stats?.filter((s: { interaction_type: string }) => s.interaction_type === 'dismissed').length || 0
    }

    logger.info('Returning job interactions and summary', 'API', { userId, summary })

    return res.status(200).json({
      success: true,
      interactions: interactions || [],
      summary,
      pagination: {
        total: count,
        limit: parseInt(limit?.toString() || '20'),
        offset: parseInt(offset?.toString() || '0')
      }
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('List interactions operation failed', 'API', { userId, error: errorMessage })
    return res.status(500).json({
      error: 'Failed to fetch interactions',
      details: errorMessage
    })
  }
}

async function getUserContext(userSupabase: SupabaseClient, userId: string): Promise<{ profile: UserProfile | null; objectives: CareerObjectives | null }> {
  try {
    const [profileResult, objectivesResult] = await Promise.all([
      userSupabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      userSupabase.from('career_objectives').select('*').eq('user_id', userId).single()
    ])

    return {
      profile: profileResult.data,
      objectives: objectivesResult.data
    }
  } catch (error) {
    logger.error('Failed to fetch user context for AI analysis', 'DATABASE', { userId, error: error.message })
    return { profile: null, objectives: null }
  }
}

async function generateJobMatchAnalysis(jobData: Record<string, unknown>, userContext: { profile: UserProfile | null; objectives: CareerObjectives | null }) {
  const prompt = `You are an expert career coach analyzing why a specific job matches a candidate's profile.

CANDIDATE PROFILE:
- Current Role: ${userContext.profile?.current_role || 'Not specified'}
- Location: ${userContext.profile?.location || 'Not specified'}
- Target Role: ${userContext.objectives?.target_role || 'Not specified'}
- Career Stage: ${userContext.objectives?.career_stage || 'Not specified'}
- Primary Goal: ${userContext.objectives?.primary_goal || 'Not specified'}
- Work Preference: ${userContext.objectives?.work_preference || 'Not specified'}

JOB TO ANALYZE:
Title: ${jobData.title}
Company: ${jobData.company?.display_name}
Location: ${jobData.location?.display_name}
Category: ${jobData.category?.label}
Salary: ${jobData.salary_min ? `$${jobData.salary_min}` : 'Not specified'} - ${jobData.salary_max ? `$${jobData.salary_max}` : 'Not specified'}
Description: ${jobData.description?.substring(0, 500)}

Provide a detailed analysis of how well this job matches the candidate. Consider:
1. Role alignment and career progression
2. Skills and experience match
3. Location and work preference compatibility
4. Salary expectations
5. Company culture fit
6. Career goals alignment

Respond with JSON in this exact format:
{
  "match_score": 85,
  "analysis": {
    "strengths": ["Strong title alignment", "Good salary range", "Matches work preference"],
    "concerns": ["Location might be challenging", "Company size unknown"],
    "overall_assessment": "This role offers excellent career progression opportunities and aligns well with your target position. The salary range meets your expectations and the job description indicates growth potential.",
    "recommendation": "apply_now",
    "next_steps": ["Research company culture", "Prepare portfolio examples", "Network with current employees"]
  }
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = message.content[0]
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }

  // Fallback analysis
  return {
    match_score: 75,
    analysis: {
      strengths: ["Job saved for detailed review"],
      concerns: [],
      overall_assessment: "AI analysis temporarily unavailable - job saved for manual review",
      recommendation: "needs_more_research",
      next_steps: ["Review job details manually"]
    }
  }
}