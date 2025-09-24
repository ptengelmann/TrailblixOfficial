// src/pages/api/jobs/search.ts
// Advanced job search API with Adzuna integration and AI matching

import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Adzuna API configuration
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs'
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY

interface JobSearchFilters {
  query?: string
  location?: string
  salary_min?: number
  salary_max?: number
  remote?: boolean
  employment_type?: string
  experience_level?: string
  page?: number
  per_page?: number
}

interface AdzunaJob {
  id: string
  title: string
  company: {
    display_name: string
  }
  location: {
    display_name: string
    area?: string[]
  }
  description: string
  salary_min?: number
  salary_max?: number
  salary_is_predicted?: number
  contract_type?: string
  contract_time?: string
  category: {
    label: string
    tag: string
  }
  created: string
  redirect_url: string
  adref?: string
}

interface EnhancedJob extends AdzunaJob {
  ai_match_score?: number
  match_reasons?: string[]
  salary_formatted?: string
  location_type?: 'remote' | 'hybrid' | 'onsite'
  experience_level?: string
  is_saved?: boolean
  is_viewed?: boolean
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

    const { 
      filters, 
      generate_ai_matching = true,
      save_search_session = true 
    } = req.body as {
      filters: JobSearchFilters
      generate_ai_matching?: boolean
      save_search_session?: boolean
    }

    // Search jobs using Adzuna API
    const adzunaJobs = await searchAdzunaJobs(filters)
    
    if (!adzunaJobs || adzunaJobs.length === 0) {
      return res.status(200).json({ 
        jobs: [], 
        total_results: 0,
        message: 'No jobs found matching your criteria'
      })
    }

    // Get user profile and career objectives for AI matching
    let enhancedJobs = adzunaJobs
    if (generate_ai_matching) {
      const userContext = await getUserContext(user.id)
      enhancedJobs = await enhanceJobsWithAI(adzunaJobs, userContext)
    }

    // Add user interaction data (saved/viewed status)
    const finalJobs = await addUserInteractionData(enhancedJobs, user.id)

    // Save search session for analytics
    if (save_search_session) {
      console.log('Attempting to save search session...')
      try {
        await saveSearchSession(user.id, filters, finalJobs.length, finalJobs.map(job => job.id))
      } catch (sessionError) {
        console.error('Failed to save search session, but continuing:', sessionError)
        // Don't fail the whole request if session saving fails
      }
    }

    return res.status(200).json({
      jobs: finalJobs,
      total_results: finalJobs.length,
      search_metadata: {
        query: filters.query,
        location: filters.location,
        filters_applied: filters,
        ai_matching_enabled: generate_ai_matching
      }
    })

  } catch (error: any) {
    console.error('Job search error:', error)
    return res.status(500).json({ 
      error: 'Failed to search jobs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

async function searchAdzunaJobs(filters: JobSearchFilters): Promise<AdzunaJob[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error('Adzuna API credentials not configured')
  }

  // Smart country detection
  let country = 'us' // Default to US
  
  if (filters.location) {
    const location = filters.location.toLowerCase()
    
    // Method 1: Use postcode patterns
    const ukPostcodePattern = /^[a-z]{1,2}[0-9][a-z0-9]?\s?[0-9][a-z]{2}$/i
    const usZipcodePattern = /^\d{5}(-\d{4})?$/
    const caPostcodePattern = /^[a-z]\d[a-z]\s?\d[a-z]\d$/i
    
    if (ukPostcodePattern.test(location.trim())) {
      country = 'gb'
    } else if (usZipcodePattern.test(location.trim())) {
      country = 'us'
    } else if (caPostcodePattern.test(location.trim())) {
      country = 'ca'
    } else {
      // Method 2: Use comprehensive keywords
      const countryKeywords = {
        'gb': [
          'uk', 'britain', 'england', 'scotland', 'wales', 'northern ireland',
          'london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'edinburgh',
          'bristol', 'leeds', 'cardiff', 'belfast', 'sheffield', 'newcastle',
          // Add some common UK terms
          'midlands', 'yorkshire', 'lancashire', 'kent', 'surrey', 'devon'
        ],
        'ca': ['canada', 'toronto', 'vancouver', 'montreal', 'calgary', 'ottawa', 'quebec'],
        'au': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra']
      }
      
      // Check if location contains any country-specific keywords
      for (const [countryCode, keywords] of Object.entries(countryKeywords)) {
        if (keywords.some(keyword => location.includes(keyword))) {
          country = countryCode
          break
        }
      }
      
      // Method 3: If still unsure and location looks European, default to GB
      const europeanIndicators = ['.co.uk', '.uk', '£', 'pounds', 'pence', 'quid']
      if (country === 'us' && europeanIndicators.some(indicator => location.includes(indicator))) {
        country = 'gb'
      }
    }
  }

  console.log(`Searching jobs in country: ${country} for location: ${filters.location}`)

  // Construct Adzuna API URL
  const page = filters.page || 1
  const per_page = Math.min(filters.per_page || 20, 50) // Max 50 per Adzuna limits
  
  const url = `${ADZUNA_BASE_URL}/${country}/search/${page}`
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: per_page.toString()
  })

  // Add content-type separately to avoid TypeScript issues
  params.append('content-type', 'application/json')

  // Add search parameters
  if (filters.query) {
    params.append('what', filters.query)
  }
  
  if (filters.location) {
    params.append('where', filters.location)
  }

  if (filters.salary_min) {
    params.append('salary_min', filters.salary_min.toString())
  }

  if (filters.salary_max) {
    params.append('salary_max', filters.salary_max.toString())
  }

  // Add employment type filter if specified
  if (filters.employment_type) {
    if (filters.employment_type === 'full_time') {
      params.append('full_time', '1')
    } else if (filters.employment_type === 'part_time') {
      params.append('part_time', '1')
    } else if (filters.employment_type === 'contract') {
      params.append('contract', '1')
    }
  }

  // Sort by relevance and date
  params.append('sort_by', 'relevance')

  const response = await fetch(`${url}?${params.toString()}`, {
    headers: {
      'User-Agent': 'Traiblix-JobSearch/1.0'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Adzuna API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.results) {
    return []
  }

  return data.results.map((job: any) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_is_predicted: job.salary_is_predicted,
    contract_type: job.contract_type,
    contract_time: job.contract_time,
    category: job.category,
    created: job.created,
    redirect_url: job.redirect_url,
    adref: job.adref
  }))
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

async function enhanceJobsWithAI(jobs: AdzunaJob[], userContext: any): Promise<EnhancedJob[]> {
  if (!userContext.objectives || jobs.length === 0) {
    return jobs.map(job => enhanceJobMetadata(job))
  }

  try {
    // Create AI prompt for job matching
    const prompt = createJobMatchingPrompt(jobs, userContext)
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const aiEnhancedJobs = JSON.parse(jsonMatch[0])
        
        return jobs.map((job, index) => {
          const enhancement = aiEnhancedJobs[index] || {}
          return {
            ...enhanceJobMetadata(job),
            ai_match_score: enhancement.match_score,
            match_reasons: enhancement.match_reasons || []
          }
        })
      }
    }
  } catch (error) {
    console.error('AI enhancement error:', error)
  }

  // Fallback: return jobs with basic enhancements
  return jobs.map(job => enhanceJobMetadata(job))
}

function enhanceJobMetadata(job: AdzunaJob): EnhancedJob {
  const enhanced: EnhancedJob = { ...job }

  // Format salary
  if (job.salary_min && job.salary_max) {
    enhanced.salary_formatted = `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
  } else if (job.salary_min) {
    enhanced.salary_formatted = `$${job.salary_min.toLocaleString()}+`
  } else if (job.salary_max) {
    enhanced.salary_formatted = `Up to $${job.salary_max.toLocaleString()}`
  }

  // Determine location type
  const description = job.description?.toLowerCase() || ''
  const title = job.title?.toLowerCase() || ''
  
  if (description.includes('remote') || title.includes('remote')) {
    enhanced.location_type = 'remote'
  } else if (description.includes('hybrid')) {
    enhanced.location_type = 'hybrid'
  } else {
    enhanced.location_type = 'onsite'
  }

  // Basic experience level detection
  if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
    enhanced.experience_level = 'senior'
  } else if (title.includes('junior') || title.includes('entry') || title.includes('graduate')) {
    enhanced.experience_level = 'junior'
  } else {
    enhanced.experience_level = 'mid'
  }

  return enhanced
}

async function addUserInteractionData(jobs: EnhancedJob[], userId: string): Promise<EnhancedJob[]> {
  try {
    const jobIds = jobs.map(job => job.id)
    
    const { data: interactions } = await supabase
      .from('job_interactions')
      .select('job_id, interaction_type')
      .eq('user_id', userId)
      .in('job_id', jobIds)

    const interactionMap = new Map<string, Set<string>>()
    interactions?.forEach(interaction => {
      if (!interactionMap.has(interaction.job_id)) {
        interactionMap.set(interaction.job_id, new Set())
      }
      interactionMap.get(interaction.job_id)?.add(interaction.interaction_type)
    })

    return jobs.map(job => ({
      ...job,
      is_saved: interactionMap.get(job.id)?.has('saved') || false,
      is_viewed: interactionMap.get(job.id)?.has('viewed') || false
    }))
  } catch (error) {
    console.error('Error adding user interaction data:', error)
    return jobs
  }
}

async function saveSearchSession(
  userId: string, 
  filters: JobSearchFilters, 
  resultsCount: number, 
  jobIds: string[]
) {
  try {
    console.log('Saving search session for user:', userId)
    
    const { data, error } = await supabase.from('job_search_sessions').insert({
      user_id: userId,
      search_query: filters.query || null,
      filters_applied: filters,
      results_count: resultsCount,
      jobs_viewed: jobIds,
      session_duration: 0 // Will be updated later if we track time
    }).select().single()

    if (error) {
      console.error('Error saving search session:', error)
      return
    }

    console.log('Search session saved successfully:', data.id)
  } catch (error) {
    console.error('Error saving search session:', error)
  }
}

function createJobMatchingPrompt(jobs: AdzunaJob[], userContext: any): string {
  const { profile, objectives } = userContext
  
  return `You are an expert career coach analyzing job matches for a candidate. 

CANDIDATE PROFILE:
- Current Role: ${profile?.current_role || 'Not specified'}
- Location: ${profile?.location || 'Not specified'}
- Target Role: ${objectives?.target_role || 'Not specified'}
- Career Stage: ${objectives?.career_stage || 'Not specified'}
- Primary Goal: ${objectives?.primary_goal || 'Not specified'}
- Work Preference: ${objectives?.work_preference || 'Not specified'}

JOBS TO ANALYZE:
${jobs.map((job, i) => `
${i + 1}. ${job.title} at ${job.company.display_name}
Location: ${job.location.display_name}
Category: ${job.category.label}
Description: ${job.description.substring(0, 300)}...
`).join('\n')}

For each job, provide a match score (0-100) and 2-3 brief reasons why it matches or doesn't match the candidate.

Respond with a JSON array in this exact format:
[
  {
    "match_score": 85,
    "match_reasons": ["Title aligns with target role", "Location matches preference", "Company size fits goals"]
  },
  ... (one object per job in the same order)
]`
}