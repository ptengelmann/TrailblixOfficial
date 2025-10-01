// Real Salary Intelligence using Adzuna API
// Fetches actual market salary data for roles and locations

import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@/lib/logger'

interface SalaryDataRequest {
  role: string
  location?: string
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
}

interface SalaryDataResponse {
  role: string
  location: string
  salary_range: {
    min: number
    max: number
    median: number
    percentile_25: number
    percentile_75: number
  }
  data_points: number
  confidence: 'high' | 'medium' | 'low'
  last_updated: string
  trends: {
    direction: 'rising' | 'stable' | 'falling'
    percentage_change: number
  }
  source: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { role, location, experience_level }: SalaryDataRequest = req.body

    if (!role) {
      return res.status(400).json({ error: 'Role is required' })
    }

    logger.info('Fetching real salary data from Adzuna', 'API', { role, location })

    const salaryData = await fetchAdzunaSalaryData(role, location || 'United States', experience_level)

    return res.status(200).json({ success: true, data: salaryData })

  } catch (error: any) {
    logger.error('Failed to fetch salary data', 'API', { error: error.message })
    return res.status(500).json({ error: 'Failed to fetch salary data', details: error.message })
  }
}

async function fetchAdzunaSalaryData(
  role: string,
  location: string,
  experienceLevel?: string
): Promise<SalaryDataResponse> {
  const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
  const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error('Adzuna API credentials not configured')
  }

  // Map location to Adzuna country code
  const countryCode = mapLocationToCountry(location)

  // Add experience level to search query
  let searchQuery = role
  if (experienceLevel) {
    const levelMap = {
      'entry': 'junior',
      'mid': '',
      'senior': 'senior',
      'executive': 'director'
    }
    const levelKeyword = levelMap[experienceLevel]
    if (levelKeyword) {
      searchQuery = `${levelKeyword} ${role}`
    }
  }

  // Fetch salary histogram data from Adzuna
  const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/histogram?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what=${encodeURIComponent(searchQuery)}&content-type=application/json`

  logger.info('Calling Adzuna API', 'EXTERNAL_API', { url: url.replace(ADZUNA_APP_KEY, '***'), query: searchQuery })

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Adzuna API returned ${response.status}`)
  }

  const data = await response.json()

  // Parse histogram data
  const salaryHistogram = data.histogram?.salary || {}

  // Extract salary data points
  const salaryPoints: number[] = []
  Object.entries(salaryHistogram).forEach(([salaryRange, count]) => {
    // Salary range format: "10000" or "50000-60000"
    const salary = parseInt(salaryRange)
    if (!isNaN(salary) && typeof count === 'number') {
      // Add this salary point 'count' times
      for (let i = 0; i < count; i++) {
        salaryPoints.push(salary)
      }
    }
  })

  // If no histogram data, try to get from job search results
  if (salaryPoints.length === 0) {
    const jobsUrl = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what=${encodeURIComponent(searchQuery)}&results_per_page=50&salary_include=1`

    const jobsResponse = await fetch(jobsUrl)
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json()

      jobsData.results?.forEach((job: any) => {
        if (job.salary_min) salaryPoints.push(job.salary_min)
        if (job.salary_max) salaryPoints.push(job.salary_max)
      })
    }
  }

  // Calculate statistics
  if (salaryPoints.length === 0) {
    // Fallback to industry averages if no data
    return getFallbackSalaryData(role, location, experienceLevel)
  }

  salaryPoints.sort((a, b) => a - b)

  const min = salaryPoints[0]
  const max = salaryPoints[salaryPoints.length - 1]
  const median = calculatePercentile(salaryPoints, 50)
  const percentile_25 = calculatePercentile(salaryPoints, 25)
  const percentile_75 = calculatePercentile(salaryPoints, 75)

  const confidence = salaryPoints.length > 30 ? 'high' : salaryPoints.length > 10 ? 'medium' : 'low'

  return {
    role,
    location,
    salary_range: {
      min: Math.round(min),
      max: Math.round(max),
      median: Math.round(median),
      percentile_25: Math.round(percentile_25),
      percentile_75: Math.round(percentile_75)
    },
    data_points: salaryPoints.length,
    confidence,
    last_updated: new Date().toISOString(),
    trends: {
      direction: 'stable', // Would need historical data to calculate
      percentage_change: 0
    },
    source: 'Adzuna'
  }
}

function calculatePercentile(sortedArray: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedArray.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index % 1

  if (lower === upper) {
    return sortedArray[lower]
  }

  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
}

function mapLocationToCountry(location: string): string {
  const locationLower = location.toLowerCase()

  if (locationLower.includes('united states') || locationLower.includes('usa') || locationLower.includes('us')) {
    return 'us'
  }
  if (locationLower.includes('united kingdom') || locationLower.includes('uk') || locationLower.includes('britain')) {
    return 'gb'
  }
  if (locationLower.includes('canada')) {
    return 'ca'
  }
  if (locationLower.includes('australia')) {
    return 'au'
  }

  // Default to US
  return 'us'
}

function getFallbackSalaryData(role: string, location: string, experienceLevel?: string): SalaryDataResponse {
  // Industry average fallbacks based on common roles
  const fallbackRanges: Record<string, any> = {
    'software engineer': { min: 70000, max: 180000, median: 120000 },
    'senior software engineer': { min: 130000, max: 220000, median: 170000 },
    'product manager': { min: 90000, max: 170000, median: 130000 },
    'data scientist': { min: 85000, max: 165000, median: 120000 },
    'designer': { min: 60000, max: 120000, median: 85000 },
    'marketing manager': { min: 65000, max: 130000, median: 95000 }
  }

  const roleKey = role.toLowerCase()
  let salaryRange = fallbackRanges[roleKey] || { min: 60000, max: 150000, median: 95000 }

  // Adjust for experience level
  if (experienceLevel === 'entry') {
    salaryRange = {
      min: Math.round(salaryRange.min * 0.7),
      max: Math.round(salaryRange.max * 0.6),
      median: Math.round(salaryRange.median * 0.65)
    }
  } else if (experienceLevel === 'senior') {
    salaryRange = {
      min: Math.round(salaryRange.min * 1.3),
      max: Math.round(salaryRange.max * 1.4),
      median: Math.round(salaryRange.median * 1.35)
    }
  } else if (experienceLevel === 'executive') {
    salaryRange = {
      min: Math.round(salaryRange.min * 1.8),
      max: Math.round(salaryRange.max * 2.2),
      median: Math.round(salaryRange.median * 2.0)
    }
  }

  return {
    role,
    location,
    salary_range: {
      ...salaryRange,
      percentile_25: Math.round(salaryRange.min + (salaryRange.median - salaryRange.min) * 0.4),
      percentile_75: Math.round(salaryRange.median + (salaryRange.max - salaryRange.median) * 0.6)
    },
    data_points: 0,
    confidence: 'low',
    last_updated: new Date().toISOString(),
    trends: {
      direction: 'stable',
      percentage_change: 0
    },
    source: 'Industry Averages (Fallback)'
  }
}
