// Advanced AI Market Intelligence System
// Real-time job market analysis with predictive modeling

import type { NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { withAIAccess, type AuthenticatedRequest } from '@/middleware/subscription'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface MarketIntelligenceRequest {
  analysis_type: 'role' | 'skills' | 'salary' | 'industry' | 'comprehensive'
  target_role?: string
  location?: string
  skills?: string[]
  industry?: string
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
  timeframe?: '30d' | '90d' | '6m' | '1y'
}

interface MarketIntelligenceResponse {
  market_overview: {
    demand_score: number
    growth_trajectory: 'explosive' | 'strong' | 'steady' | 'declining'
    market_size: {
      total_openings: number
      new_openings_per_week: number
      competition_index: number
    }
    key_insights: string[]
  }
  salary_intelligence: {
    current_range: {
      min: number
      max: number
      median: number
      currency: string
    }
    trend_analysis: {
      direction: 'rising' | 'stable' | 'falling'
      percentage_change: number
      prediction_6m: number
      prediction_12m: number
    }
    factors_driving_change: string[]
  }
  skills_landscape: {
    in_demand_skills: Array<{
      skill: string
      demand_score: number
      growth_rate: number
      salary_impact: number
      rarity_index: number
    }>
    emerging_skills: Array<{
      skill: string
      adoption_rate: number
      future_importance: number
      recommended_action: string
    }>
    declining_skills: Array<{
      skill: string
      decline_rate: number
      replacement_suggestions: string[]
    }>
  }
  opportunity_analysis: {
    best_locations: Array<{
      location: string
      opportunity_score: number
      avg_salary: number
      openings_count: number
      competition_level: 'low' | 'medium' | 'high'
    }>
    optimal_timing: {
      best_months_to_apply: string[]
      seasonal_trends: string
      market_cycles: string
    }
    career_progression: {
      typical_next_roles: string[]
      average_time_to_promotion: string
      key_advancement_factors: string[]
    }
  }
  competitive_intelligence: {
    market_positioning: string
    differentiation_opportunities: string[]
    threat_analysis: string[]
  }
  predictive_insights: {
    '6_month_forecast': {
      demand_prediction: number
      salary_prediction: number
      skills_evolution: string[]
      key_developments: string[]
    }
    '12_month_outlook': {
      market_transformation: string
      disruptive_factors: string[]
      strategic_recommendations: string[]
    }
  }
  generated_at: string
  data_freshness: string
  confidence_score: number
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<MarketIntelligenceResponse | { error: string; success?: boolean; message?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { analysis_type, target_role, location, skills, industry, experience_level, timeframe } = req.body as MarketIntelligenceRequest

    // Validate input
    if (!analysis_type) {
      return res.status(400).json({ error: 'analysis_type is required' })
    }

    logger.info('Market intelligence analysis started', 'MARKET_AI', {
      analysis_type,
      target_role,
      location,
      industry,
      experience_level
    })

    // Generate comprehensive market intelligence
    const intelligence = await generateMarketIntelligence({
      analysis_type,
      target_role,
      location,
      skills,
      industry,
      experience_level,
      timeframe: timeframe || '90d'
    })

    // Save analysis for future reference and model training
    await saveMarketAnalysis({
      analysis_type,
      target_role,
      location,
      industry,
      experience_level,
      intelligence
    })

    logger.info('Market intelligence analysis completed', 'MARKET_AI', {
      confidence_score: intelligence.confidence_score,
      demand_score: intelligence.market_overview.demand_score
    })

    res.status(200).json(intelligence)

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Market intelligence analysis failed', 'MARKET_AI', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })

    res.status(500).json({
      error: 'Failed to generate market intelligence',
      // details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}

async function generateMarketIntelligence(params: MarketIntelligenceRequest): Promise<MarketIntelligenceResponse> {
  // Get real-time market data
  const marketData = await fetchRealTimeMarketData(params)

  // Generate AI analysis
  const prompt = createMarketIntelligencePrompt(params, marketData)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const content = message.content[0]
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const aiAnalysis = JSON.parse(jsonMatch[0])

        // Enhance with real data and calculations
        return {
          ...aiAnalysis,
          generated_at: new Date().toISOString(),
          data_freshness: 'Last updated: ' + new Date().toLocaleString(),
          confidence_score: calculateConfidenceScore(params, marketData)
        }
      } catch (parseError) {
        throw new Error('Failed to parse AI analysis')
      }
    }
  }

  throw new Error('Invalid AI response format')
}

async function fetchRealTimeMarketData(params: MarketIntelligenceRequest) {
  const queries = []

  // Build search queries based on parameters
  if (params.target_role) {
    queries.push(params.target_role)
  }

  if (params.skills && params.skills.length > 0) {
    queries.push(...params.skills)
  }

  const marketData = {
    job_postings_analyzed: 0,
    avg_salary_data: [],
    skills_frequency: {},
    location_data: {},
    posting_dates: [],
    companies: [],
    requirements_analysis: {}
  }

  // Fetch from multiple sources
  try {
    // Adzuna API calls for real market data
    for (const query of queries.slice(0, 3)) { // Limit to prevent rate limiting
      const adzunaData = await fetchAdzunaData(query, params.location)
      if (adzunaData) {
        marketData.job_postings_analyzed += adzunaData.count || 0
        marketData.avg_salary_data.push(...(adzunaData.salaries || []))

        // Extract skills and requirements from job descriptions
        adzunaData.jobs?.forEach((job: any) => {
          extractSkillsFromDescription(job.description, marketData.skills_frequency)
          extractRequirementsFromDescription(job.description, marketData.requirements_analysis)
        })
      }
    }

    // Get historical data from our database
    const historicalData = await getHistoricalMarketData(params)
    if (historicalData) {
      marketData.posting_dates = historicalData.dates || []
      marketData.companies = historicalData.companies || []
    }

  } catch (error) {
    logger.warn('Some market data sources failed, using fallback data', 'MARKET_AI', { error })
  }

  return marketData
}

async function fetchAdzunaData(query: string, location?: string) {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    return null
  }

  try {
    const country = location?.toLowerCase().includes('uk') ? 'gb' : 'us'
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`

    const params = new URLSearchParams({
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      what: query,
      results_per_page: '50',
      sort_by: 'date'
    })

    if (location) {
      params.append('where', location)
    }

    const response = await fetch(`${url}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      count: data.count || 0,
      jobs: data.results || [],
      salaries: data.results?.map((job: any) => ({
        min: job.salary_min,
        max: job.salary_max,
        currency: job.currency || 'USD'
      })).filter((salary: any) => salary.min || salary.max) || []
    }
  } catch (error) {
    logger.warn('Adzuna data fetch failed', 'MARKET_AI', { query, location, error })
    return null
  }
}

async function getHistoricalMarketData(params: MarketIntelligenceRequest) {
  try {
    const { data, error } = await supabase
      .from('market_intelligence_cache')
      .select('*')
      .eq('target_role', params.target_role)
      .eq('location', params.location || 'global')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      logger.warn('Historical data fetch failed', 'DATABASE', { error: error.message })
      return null
    }

    return {
      dates: data?.map(d => d.created_at) || [],
      companies: data?.flatMap(d => d.analysis_data?.companies || []) || []
    }
  } catch (error) {
    logger.warn('Historical market data query failed', 'DATABASE', { error })
    return null
  }
}

function extractSkillsFromDescription(description: string, skillsFreq: Record<string, number>) {
  if (!description) return

  const commonSkills = [
    'python', 'javascript', 'react', 'node.js', 'aws', 'docker', 'kubernetes',
    'machine learning', 'sql', 'mongodb', 'postgresql', 'git', 'agile',
    'typescript', 'java', 'c++', 'html', 'css', 'angular', 'vue.js',
    'rest api', 'graphql', 'microservices', 'ci/cd', 'terraform',
    'leadership', 'communication', 'problem solving', 'teamwork'
  ]

  const descLower = description.toLowerCase()

  commonSkills.forEach(skill => {
    if (descLower.includes(skill)) {
      skillsFreq[skill] = (skillsFreq[skill] || 0) + 1
    }
  })
}

function extractRequirementsFromDescription(description: string, requirements: Record<string, number>) {
  if (!description) return

  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+experience/gi,
    /(\d+)\+?\s*years?\s+of\s+experience/gi,
    /minimum\s+(\d+)\s+years/gi,
    /at\s+least\s+(\d+)\s+years/gi
  ]

  experiencePatterns.forEach(pattern => {
    const matches = description.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const years = match.match(/\d+/)?.[0]
        if (years) {
          const key = `${years}_years_experience`
          requirements[key] = (requirements[key] || 0) + 1
        }
      })
    }
  })
}

function createMarketIntelligencePrompt(params: MarketIntelligenceRequest, marketData: any): string {
  return `You are an elite market intelligence analyst with access to real-time job market data. Analyze the current market conditions and provide comprehensive insights.

ANALYSIS PARAMETERS:
- Target Role: ${params.target_role || 'General market analysis'}
- Location: ${params.location || 'Global'}
- Industry: ${params.industry || 'Technology'}
- Experience Level: ${params.experience_level || 'All levels'}
- Timeframe: ${params.timeframe}

REAL-TIME MARKET DATA:
- Job Postings Analyzed: ${marketData.job_postings_analyzed}
- Skills Frequency: ${JSON.stringify(marketData.skills_frequency)}
- Average Salary Range: ${marketData.avg_salary_data.length > 0 ?
  `$${Math.min(...marketData.avg_salary_data.map(s => s.min || 0).filter(x => x > 0))} - $${Math.max(...marketData.avg_salary_data.map(s => s.max || 0))}` :
  'Data being analyzed'}

CURRENT MARKET CONTEXT (2025):
- AI and automation are reshaping all industries
- Remote/hybrid work is standard
- Skills-based hiring is dominant
- Economic uncertainty affecting hiring patterns
- Generative AI skills in extremely high demand
- Cybersecurity critical due to increased threats
- Sustainability and ESG increasingly important
- Data privacy regulations affecting tech roles

Provide a comprehensive analysis in this exact JSON format:

{
  "market_overview": {
    "demand_score": 85,
    "growth_trajectory": "strong",
    "market_size": {
      "total_openings": 15000,
      "new_openings_per_week": 450,
      "competition_index": 0.72
    },
    "key_insights": [
      "Market insight 1",
      "Market insight 2",
      "Market insight 3"
    ]
  },
  "salary_intelligence": {
    "current_range": {
      "min": 80000,
      "max": 150000,
      "median": 115000,
      "currency": "USD"
    },
    "trend_analysis": {
      "direction": "rising",
      "percentage_change": 12,
      "prediction_6m": 120000,
      "prediction_12m": 125000
    },
    "factors_driving_change": [
      "Factor 1",
      "Factor 2"
    ]
  },
  "skills_landscape": {
    "in_demand_skills": [
      {
        "skill": "Python",
        "demand_score": 95,
        "growth_rate": 23,
        "salary_impact": 15,
        "rarity_index": 0.3
      }
    ],
    "emerging_skills": [
      {
        "skill": "LLM Integration",
        "adoption_rate": 45,
        "future_importance": 92,
        "recommended_action": "Start learning immediately"
      }
    ],
    "declining_skills": [
      {
        "skill": "Legacy Technology",
        "decline_rate": -15,
        "replacement_suggestions": ["Modern alternative 1", "Modern alternative 2"]
      }
    ]
  },
  "opportunity_analysis": {
    "best_locations": [
      {
        "location": "San Francisco",
        "opportunity_score": 92,
        "avg_salary": 165000,
        "openings_count": 2800,
        "competition_level": "high"
      }
    ],
    "optimal_timing": {
      "best_months_to_apply": ["January", "September"],
      "seasonal_trends": "Peak hiring in Q1 and Q4",
      "market_cycles": "2-3 year innovation cycles"
    },
    "career_progression": {
      "typical_next_roles": ["Senior Role", "Lead Role"],
      "average_time_to_promotion": "18-24 months",
      "key_advancement_factors": ["Leadership", "Technical expertise", "Business impact"]
    }
  },
  "competitive_intelligence": {
    "market_positioning": "Highly competitive market with premium opportunities",
    "differentiation_opportunities": ["AI expertise", "Cross-functional skills"],
    "threat_analysis": ["Market saturation", "Economic slowdown", "Automation"]
  },
  "predictive_insights": {
    "6_month_forecast": {
      "demand_prediction": 88,
      "salary_prediction": 120000,
      "skills_evolution": ["AI integration", "Cloud native"],
      "key_developments": ["Market development 1", "Market development 2"]
    },
    "12_month_outlook": {
      "market_transformation": "AI-first development becoming standard",
      "disruptive_factors": ["Regulatory changes", "Economic shifts"],
      "strategic_recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  }
}`
}

function calculateConfidenceScore(params: MarketIntelligenceRequest, marketData: any): number {
  let score = 70 // Base confidence

  // Adjust based on data quality
  if (marketData.job_postings_analyzed > 100) score += 10
  if (marketData.job_postings_analyzed > 500) score += 5
  if (marketData.avg_salary_data.length > 20) score += 10
  if (Object.keys(marketData.skills_frequency).length > 10) score += 5

  // Adjust based on parameters specificity
  if (params.target_role && params.target_role.length > 5) score += 5
  if (params.location) score += 3
  if (params.industry) score += 2

  return Math.min(score, 95)
}

async function saveMarketAnalysis(data: any) {
  try {
    await supabase
      .from('market_intelligence_cache')
      .insert({
        analysis_type: data.analysis_type,
        target_role: data.target_role,
        location: data.location || 'global',
        industry: data.industry,
        experience_level: data.experience_level,
        analysis_data: data.intelligence,
        confidence_score: data.intelligence.confidence_score
      })
  } catch (error) {
    logger.warn('Failed to save market analysis', 'DATABASE', { error })
    // Don't fail the request if caching fails
  }
}

// Export handler with AI access middleware (tracks usage)
export default withAIAccess(handler, 'ai_insights_per_month')