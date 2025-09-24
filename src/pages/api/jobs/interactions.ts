// src/pages/api/jobs/interactions.ts
// Handle job interactions: save, view, apply, dismiss

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface JobInteractionRequest {
  action: 'create' | 'update' | 'delete' | 'list'
  job_id?: string
  job_data?: any
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

  // Verify authentication
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' })
    }

    const requestData = req.body as JobInteractionRequest
    const { action } = requestData

    console.log('Job interactions API called with action:', action, 'by user:', user.id)

    switch (action) {
      case 'create':
        return await createInteraction(res, user.id, requestData)
      
      case 'update':
        return await updateInteraction(res, user.id, requestData)
      
      case 'delete':
        return await deleteInteraction(res, user.id, requestData)
      
      case 'list':
        return await listInteractions(res, user.id, requestData)
      
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

  } catch (error: any) {
    console.error('Job interaction handler error:', error)
    return res.status(500).json({ 
      error: 'Failed to process job interaction',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

async function createInteraction(
  res: NextApiResponse,
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    const { job_id, job_data, interaction_type, notes, generate_ai_analysis } = requestData

    if (!job_id || !job_data || !interaction_type) {
      return res.status(400).json({ error: 'Missing required fields: job_id, job_data, interaction_type' })
    }

    console.log('Creating interaction:', { userId, job_id, interaction_type })

    // Check if interaction already exists
    const { data: existing, error: checkError } = await supabase
      .from('job_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', job_id)
      .eq('interaction_type', interaction_type)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing interaction:', checkError)
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
        const userContext = await getUserContext(userId)
        if (userContext.objectives) {
          const analysis = await generateJobMatchAnalysis(job_data, userContext)
          aiMatchScore = analysis.match_score
          matchAnalysis = analysis.analysis
        }
      } catch (error) {
        console.error('AI analysis error:', error)
        // Continue without AI analysis
      }
    }

    // Create the interaction
    const { data, error } = await supabase
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
      console.error('Error creating interaction:', error)
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

  } catch (error: any) {
    console.error('Create interaction error:', error)
    return res.status(500).json({ 
      error: 'Failed to create interaction', 
      details: error.message 
    })
  }
}

async function updateInteraction(
  res: NextApiResponse,
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    const { job_id, interaction_type, notes } = requestData

    if (!job_id) {
      return res.status(400).json({ error: 'Missing required field: job_id' })
    }

    const updateData: any = {}
    if (interaction_type) updateData.interaction_type = interaction_type
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('job_interactions')
      .update(updateData)
      .eq('user_id', userId)
      .eq('job_id', job_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating interaction:', error)
      return res.status(500).json({ error: 'Failed to update interaction', details: error.message })
    }

    return res.status(200).json({
      success: true,
      interaction: data
    })

  } catch (error: any) {
    console.error('Update interaction error:', error)
    return res.status(500).json({ 
      error: 'Failed to update interaction', 
      details: error.message 
    })
  }
}

async function deleteInteraction(
  res: NextApiResponse,
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    const { job_id, interaction_type } = requestData

    if (!job_id) {
      return res.status(400).json({ error: 'Missing required field: job_id' })
    }

    let query = supabase
      .from('job_interactions')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', job_id)

    if (interaction_type) {
      query = query.eq('interaction_type', interaction_type)
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting interaction:', error)
      return res.status(500).json({ error: 'Failed to delete interaction', details: error.message })
    }

    return res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete interaction error:', error)
    return res.status(500).json({ 
      error: 'Failed to delete interaction', 
      details: error.message 
    })
  }
}

async function listInteractions(
  res: NextApiResponse,
  userId: string,
  requestData: JobInteractionRequest
) {
  try {
    console.log('Listing interactions for user:', userId, 'with params:', requestData)

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

    let query = supabase
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

    console.log('Executing query for interactions...')
    const { data: interactions, error, count } = await query

    if (error) {
      console.error('Error fetching interactions:', error)
      return res.status(500).json({ error: 'Failed to fetch interactions', details: error.message })
    }

    console.log('Found', interactions?.length || 0, 'interactions')

    // Get summary stats
    console.log('Fetching summary stats...')
    const { data: stats, error: statsError } = await supabase
      .from('job_interactions')
      .select('interaction_type')
      .eq('user_id', userId)

    if (statsError) {
      console.error('Error fetching stats:', statsError)
      // Continue without stats rather than failing
    }

    const summary = {
      total_interactions: stats?.length || 0,
      saved_jobs: stats?.filter(s => s.interaction_type === 'saved').length || 0,
      applied_jobs: stats?.filter(s => s.interaction_type === 'applied').length || 0,
      viewed_jobs: stats?.filter(s => s.interaction_type === 'viewed').length || 0,
      dismissed_jobs: stats?.filter(s => s.interaction_type === 'dismissed').length || 0
    }

    console.log('Returning interactions and summary:', summary)

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

  } catch (error: any) {
    console.error('List interactions error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch interactions', 
      details: error.message 
    })
  }
}

async function getUserContext(userId: string) {
  try {
    const [profileResult, objectivesResult] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('career_objectives').select('*').eq('user_id', userId).single()
    ])

    return {
      profile: profileResult.data,
      objectives: objectivesResult.data
    }
  } catch (error) {
    console.error('Error fetching user context:', error)
    return { profile: null, objectives: null }
  }
}

async function generateJobMatchAnalysis(jobData: any, userContext: any) {
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