// src/pages/api/jobs/search.ts
// Advanced multi-source job search API with AI matching and caching

import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { UserProfile, CareerObjectives } from '@/types/api'
import { logger } from '@/lib/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Multi-source API configuration
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs'
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY

const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com/search'
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY

const REED_BASE_URL = 'https://www.reed.co.uk/api/1.0/search'
const REED_API_KEY = process.env.REED_API_KEY

// In-memory cache for search results (expires after 5 minutes)
const searchCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
      save_search_session = true,
      sources = ['adzuna', 'jsearch', 'reed']
    } = req.body as {
      filters: JobSearchFilters
      generate_ai_matching?: boolean
      save_search_session?: boolean
      sources?: string[]
    }

    // Check cache first
    const cacheKey = JSON.stringify({ filters, sources, userId: user.id })
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Returning cached job search results', 'CACHE')
      return res.status(200).json(cached.data)
    }

    // Detect country from location for better API routing
    const countryData = detectCountry(filters.location || '')
    logger.info('Country detection result', 'SEARCH', {
      location: filters.location,
      detectedCountry: countryData.country,
      isUK: countryData.isUK
    })

    // Search jobs from multiple sources in parallel
    const jobPromises: Promise<AdzunaJob[]>[] = []

    if (sources.includes('adzuna')) {
      jobPromises.push(searchAdzunaJobs(filters, countryData).catch(err => {
        logger.error('Adzuna search failed', 'API', { error: err.message })
        return []
      }))
    }

    if (sources.includes('jsearch')) {
      jobPromises.push(searchJSearchJobs(filters, countryData).catch(err => {
        logger.error('JSearch search failed', 'API', { error: err.message })
        return []
      }))
    }

    if (sources.includes('reed') && countryData.isUK) {
      jobPromises.push(searchReedJobs(filters).catch(err => {
        logger.error('Reed search failed', 'API', { error: err.message })
        return []
      }))
    }

    // Wait for all sources to complete
    const jobResults = await Promise.all(jobPromises)
    const allJobs = jobResults.flat()

    logger.info('Multi-source job search completed', 'SEARCH', {
      totalJobs: allJobs.length,
      sourceBreakdown: {
        adzuna: jobResults[0]?.length || 0,
        jsearch: jobResults[1]?.length || 0,
        reed: jobResults[2]?.length || 0
      }
    })

    if (!allJobs || allJobs.length === 0) {
      return res.status(200).json({
        jobs: [],
        total_results: 0,
        message: 'No jobs found matching your criteria. Try adjusting your search terms or location.',
        search_metadata: {
          sources_searched: sources,
          country_detected: countryData.country
        }
      })
    }

    // Remove duplicates based on title and company
    const uniqueJobs = deduplicateJobs(allJobs)
    logger.info(`Removed ${allJobs.length - uniqueJobs.length} duplicate jobs`, 'SEARCH')

    // Get user profile and career objectives for AI matching
    let enhancedJobs = uniqueJobs
    if (generate_ai_matching) {
      const userContext = await getUserContext(user.id)
      enhancedJobs = await enhanceJobsWithAI(uniqueJobs, userContext)
    }

    // Add user interaction data (saved/viewed status)
    const finalJobs = await addUserInteractionData(enhancedJobs, user.id)

    // Save search session for analytics
    if (save_search_session) {
      logger.info('Attempting to save search session', 'API')
      try {
        await saveSearchSession(user.id, filters, finalJobs.length, finalJobs.map(job => job.id))
      } catch (sessionError) {
        logger.error('Failed to save search session, but continuing', 'API', { error: sessionError instanceof Error ? sessionError.message : 'Unknown error' })
      }
    }

    const responseData = {
      jobs: finalJobs,
      total_results: finalJobs.length,
      search_metadata: {
        query: filters.query,
        location: filters.location,
        country_detected: countryData.country,
        filters_applied: filters,
        ai_matching_enabled: generate_ai_matching,
        sources_searched: sources,
        source_breakdown: {
          adzuna: jobResults[0]?.length || 0,
          jsearch: jobResults[1]?.length || 0,
          reed: jobResults[2]?.length || 0
        }
      }
    }

    // Cache the results
    searchCache.set(cacheKey, { data: responseData, timestamp: Date.now() })

    return res.status(200).json(responseData)

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    logger.error('Job search failed', 'API', { error: errorMessage, stack: errorStack })
    return res.status(500).json({
      error: 'Failed to search jobs',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}

// Enhanced country detection function
function detectCountry(location: string): { country: string; isUK: boolean; normalizedLocation: string } {
  const loc = location.toLowerCase().trim()

  if (!loc) {
    return { country: 'us', isUK: false, normalizedLocation: '' }
  }

  // UK postcode patterns (comprehensive)
  const ukPostcodePattern = /^[a-z]{1,2}\d{1,2}[a-z]?\s?\d[a-z]{2}$/i

  // UK-specific keywords (expanded list)
  const ukKeywords = [
    // Countries
    'uk', 'britain', 'england', 'scotland', 'wales', 'northern ireland', 'great britain',
    // Major cities
    'london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'edinburgh',
    'bristol', 'leeds', 'cardiff', 'belfast', 'sheffield', 'newcastle', 'nottingham',
    'leicester', 'coventry', 'bradford', 'stoke', 'wolverhampton', 'plymouth',
    'southampton', 'reading', 'derby', 'portsmouth', 'brighton', 'oxford', 'cambridge',
    // Regions
    'midlands', 'yorkshire', 'lancashire', 'kent', 'surrey', 'devon', 'cornwall',
    'essex', 'sussex', 'hampshire', 'norfolk', 'suffolk', 'cheshire', 'derbyshire',
    'greater london', 'west midlands', 'south east', 'north west', 'south west',
    // Counties
    'hertfordshire', 'berkshire', 'buckinghamshire', 'oxfordshire', 'cambridgeshire'
  ]

  // Check UK postcode pattern
  if (ukPostcodePattern.test(loc)) {
    return { country: 'gb', isUK: true, normalizedLocation: location }
  }

  // Check UK keywords
  if (ukKeywords.some(keyword => loc.includes(keyword))) {
    return { country: 'gb', isUK: true, normalizedLocation: location }
  }

  // US zipcode pattern
  const usZipcodePattern = /^\d{5}(-\d{4})?$/
  if (usZipcodePattern.test(loc)) {
    return { country: 'us', isUK: false, normalizedLocation: location }
  }

  // Canada postal code pattern
  const caPostcodePattern = /^[a-z]\d[a-z]\s?\d[a-z]\d$/i
  if (caPostcodePattern.test(loc)) {
    return { country: 'ca', isUK: false, normalizedLocation: location }
  }

  // Check other countries
  if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver') || loc.includes('montreal')) {
    return { country: 'ca', isUK: false, normalizedLocation: location }
  }

  if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne') || loc.includes('brisbane')) {
    return { country: 'au', isUK: false, normalizedLocation: location }
  }

  // Default to US
  return { country: 'us', isUK: false, normalizedLocation: location }
}

// Deduplicate jobs based on title and company similarity
function deduplicateJobs(jobs: AdzunaJob[]): AdzunaJob[] {
  const seen = new Map<string, AdzunaJob>()

  for (const job of jobs) {
    const key = `${job.title.toLowerCase().trim()}-${job.company.display_name.toLowerCase().trim()}`
    if (!seen.has(key)) {
      seen.set(key, job)
    }
  }

  return Array.from(seen.values())
}

async function searchAdzunaJobs(filters: JobSearchFilters, countryData: { country: string; isUK: boolean }): Promise<AdzunaJob[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    logger.warn('Adzuna API credentials not configured', 'API')
    return []
  }

  const country = countryData.country
  logger.info(`Searching Adzuna in country: ${country}`, 'ADZUNA', { location: filters.location, country })

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

  return data.results.map((job: Record<string, unknown>) => {
    const redirectUrl = job.redirect_url as string || ''

    // Ensure URL is valid
    let validUrl = redirectUrl
    if (redirectUrl && !redirectUrl.startsWith('http')) {
      validUrl = `https://${redirectUrl}`
    }

    return {
      id: `adzuna-${job.id}`,
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
      redirect_url: validUrl,
      adref: job.adref,
      source: 'adzuna' as const
    }
  })
}

async function searchJSearchJobs(filters: JobSearchFilters, _countryData: { country: string; isUK: boolean }): Promise<AdzunaJob[]> {
  if (!JSEARCH_API_KEY) {
    logger.warn('JSearch API key not configured', 'API')
    return []
  }

  try {
    const params = new URLSearchParams()

    // Build query
    let query = filters.query || 'Software Engineer'
    if (filters.location) {
      query += ` in ${filters.location}`
    }
    params.append('query', query)
    params.append('page', '1')
    params.append('num_pages', '1')
    params.append('date_posted', 'month')

    if (filters.remote) {
      params.append('remote_jobs_only', 'true')
    }

    if (filters.employment_type) {
      params.append('employment_types', filters.employment_type.toUpperCase())
    }

    const response = await fetch(`${JSEARCH_BASE_URL}?${params.toString()}`, {
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      logger.error(`JSearch API error: ${response.status}`, 'JSEARCH')
      return []
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return []
    }

    logger.info(`JSearch returned ${data.data.length} jobs`, 'JSEARCH')

    return data.data.map((job: any) => {
      const applyLink = job.job_apply_link || job.job_google_link || ''
      let validUrl = applyLink
      if (applyLink && !applyLink.startsWith('http')) {
        validUrl = `https://${applyLink}`
      }

      return {
        id: `jsearch-${job.job_id}`,
        title: job.job_title,
        company: {
          display_name: job.employer_name,
          logo_url: job.employer_logo
        },
        location: {
          display_name: job.job_city && job.job_country
            ? `${job.job_city}, ${job.job_country}`
            : job.job_country || 'Remote'
        },
        description: job.job_description || '',
        salary_min: job.job_min_salary,
        salary_max: job.job_max_salary,
        contract_type: job.job_employment_type,
        category: {
          label: job.job_occupation || 'General',
          tag: 'general'
        },
        created: job.job_posted_at_datetime_utc || new Date().toISOString(),
        redirect_url: validUrl,
        source: 'jsearch' as const
      }
    })
  } catch (error) {
    logger.error('JSearch API request failed', 'JSEARCH', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return []
  }
}

async function searchReedJobs(filters: JobSearchFilters): Promise<AdzunaJob[]> {
  if (!REED_API_KEY) {
    logger.warn('Reed API key not configured', 'API')
    return []
  }

  try {
    const params = new URLSearchParams()

    if (filters.query) {
      params.append('keywords', filters.query)
    }

    if (filters.location) {
      params.append('locationName', filters.location)
    }

    if (filters.salary_min) {
      params.append('minimumSalary', filters.salary_min.toString())
    }

    if (filters.salary_max) {
      params.append('maximumSalary', filters.salary_max.toString())
    }

    params.append('resultsToTake', '20')

    const authHeader = `Basic ${Buffer.from(`${REED_API_KEY}:`).toString('base64')}`

    const response = await fetch(`${REED_BASE_URL}?${params.toString()}`, {
      headers: {
        'Authorization': authHeader
      }
    })

    if (!response.ok) {
      logger.error(`Reed API error: ${response.status}`, 'REED')
      return []
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return []
    }

    logger.info(`Reed returned ${data.results.length} jobs`, 'REED')

    return data.results.map((job: any) => {
      const jobUrl = job.jobUrl || ''
      let validUrl = jobUrl
      if (jobUrl && !jobUrl.startsWith('http')) {
        validUrl = `https://www.reed.co.uk${jobUrl.startsWith('/') ? jobUrl : `/${jobUrl}`}`
      }

      return {
        id: `reed-${job.jobId}`,
        title: job.jobTitle,
        company: {
          display_name: job.employerName
        },
        location: {
          display_name: job.locationName
        },
        description: job.jobDescription,
        salary_min: job.minimumSalary,
        salary_max: job.maximumSalary,
        contract_type: job.contractType,
        category: {
          label: job.jobCategory || 'General',
          tag: 'general'
        },
        created: job.date || new Date().toISOString(),
        redirect_url: validUrl,
        source: 'reed' as const
      }
    })
  } catch (error) {
    logger.error('Reed API request failed', 'REED', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return []
  }
}

async function getUserContext(userId: string): Promise<{ profile: UserProfile | null; objectives: CareerObjectives | null }> {
  try {
    const [profileResult, objectivesResult] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('career_objectives').select('*').eq('user_id', userId).single()
    ])

    return {
      profile: profileResult.data,
      objectives: objectivesResult.data
    }
  } catch (error: unknown) {
    logger.error('Failed to fetch user context', 'DATABASE', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { profile: null, objectives: null }
  }
}

async function enhanceJobsWithAI(jobs: AdzunaJob[], userContext: { profile: UserProfile | null; objectives: CareerObjectives | null }): Promise<EnhancedJob[]> {
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
    logger.error('AI job enhancement failed', 'AI', {
      error: error instanceof Error ? error.message : 'Unknown error',
      jobCount: jobs.length
    })
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
    logger.error('Failed to add user interaction data', 'DATABASE', {
      userId,
      jobCount: jobs.length,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
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
    logger.info(`Saving search session for user: ${userId}`, 'DATABASE', { userId, resultsCount, filtersApplied: Object.keys(filters).length })
    
    const { data, error } = await supabase.from('job_search_sessions').insert({
      user_id: userId,
      search_query: filters.query || null,
      filters_applied: filters,
      results_count: resultsCount,
      jobs_viewed: jobIds,
      session_duration: 0 // Will be updated later if we track time
    }).select().single()

    if (error) {
      logger.error('Failed to save search session', 'DATABASE', { userId, error: error.message })
      return
    }

    logger.info(`Search session saved successfully: ${data.id}`, 'DATABASE', { sessionId: data.id, userId })
  } catch (error) {
    logger.error('Search session save failed unexpectedly', 'DATABASE', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

function createJobMatchingPrompt(jobs: AdzunaJob[], userContext: { profile: UserProfile | null; objectives: CareerObjectives | null }): string {
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