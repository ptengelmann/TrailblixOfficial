// src/pages/api/generate-recommendations.ts
// Enhanced AI career recommendations with deep personalization

import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { careerGoals, profile, resumeData } = req.body

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: buildAdvancedPrompt(careerGoals, profile, resumeData)
        }
      ]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        
        // Enhance with metadata
        const enhancedData = {
          ...data,
          generated_at: new Date().toISOString(),
          confidence_score: calculateConfidenceScore(careerGoals, profile),
          next_review_date: getNextReviewDate(careerGoals.timeline),
          personalization_factors: getPersonalizationFactors(careerGoals, profile)
        }
        
        return res.status(200).json(enhancedData)
      }
    }

    throw new Error('Failed to parse AI response')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to generate AI recommendations', 'AI', { error: errorMessage, requestData: JSON.stringify(req.body)?.substring(0, 200) + '...' })
    return res.status(500).json({ error: 'Failed to generate recommendations' })
  }
}

function buildAdvancedPrompt(careerGoals: Record<string, unknown>, profile: Record<string, unknown>, resumeData?: Record<string, unknown>) {
  const industryContext = getIndustryContext(careerGoals.target_industry, careerGoals.target_role)
  const marketTrends = getMarketTrends(careerGoals.target_role)
  const experienceLevel = getExperienceLevel(careerGoals.career_stage)
  
  return `You are an elite career strategist and executive coach with 20+ years of experience placing professionals at top companies. You combine deep industry knowledge with current market insights to provide actionable, specific guidance.

PERSON'S PROFILE:
Current Stage: ${careerGoals.career_stage}
Current Role: ${profile?.current_role || 'Transitioning'}
Location: ${profile?.location || 'Not specified'}
Target Role: ${careerGoals.target_role}
Target Industry: ${careerGoals.target_industry || 'Not specified'}
Primary Goal: ${careerGoals.primary_goal}
Timeline: ${careerGoals.timeline}
Work Preference: ${careerGoals.work_preference}
Current Situation: ${careerGoals.current_situation}

${resumeData ? `RESUME ANALYSIS INSIGHTS:
Resume Score: ${resumeData.score}/100
Key Strengths: ${resumeData.strengths?.join(', ')}
Areas for Improvement: ${resumeData.improvements?.join(', ')}` : ''}

INDUSTRY CONTEXT:
${industryContext}

CURRENT MARKET TRENDS:
${marketTrends}

EXPERIENCE LEVEL CONSIDERATIONS:
${experienceLevel}

Based on this comprehensive analysis, provide strategic career recommendations that are:
1. Hyper-specific and immediately actionable
2. Based on current market realities
3. Tailored to their exact experience level and situation
4. Include concrete timelines and metrics where possible

Respond with this exact JSON structure:
{
  "recommendations": [
    {
      "title": "Specific recommendation title",
      "description": "Detailed actionable steps",
      "priority": "high/medium/low",
      "timeline": "specific timeframe (e.g., 'Next 30 days', '3-6 months')",
      "difficulty": "easy/moderate/challenging",
      "impact": "high/medium/low",
      "specific_actions": [
        "Concrete action 1",
        "Concrete action 2"
      ],
      "success_metrics": "How to measure success",
      "resources": ["Specific tools, courses, or platforms to use"]
    }
  ],
  "priority_focus": "The #1 thing they should focus on right now",
  "timeline_roadmap": {
    "30_days": "What to accomplish in 30 days",
    "90_days": "3-month milestone", 
    "6_months": "6-month goal"
  },
  "market_insights": "2-3 sentences about current market conditions for their target role",
  "red_flags": ["Potential pitfalls to avoid based on their profile"],
  "confidence_factors": ["What's working in their favor"],
  "next_steps": "Immediate next action to take after reading these recommendations"
}`
}

function getIndustryContext(industry: string, role: string): string {
  const contexts: { [key: string]: string } = {
    'tech': `Tech industry is currently experiencing AI transformation, with high demand for AI/ML skills. Remote work is standard. Emphasis on full-stack capabilities and product thinking.`,
    'finance': `Finance sector is digitalizing rapidly. Fintech skills highly valued. Regulatory compliance knowledge essential. Hybrid work becoming norm.`,
    'healthcare': `Healthcare technology is booming. Digital health expertise in high demand. Focus on patient outcomes and data privacy.`,
    'default': `Current market favors professionals with digital skills, adaptability, and cross-functional collaboration abilities.`
  }
  
  return contexts[industry?.toLowerCase()] || contexts['default']
}

function getMarketTrends(role: string): string {
  const trends: { [key: string]: string } = {
    'software engineer': `High demand for AI/ML engineers. Full-stack preferred over specialists. Open source contributions matter. Remote-first culture.`,
    'product manager': `AI product management skills critical. Data-driven decision making expected. Customer research and UX collaboration essential.`,
    'data scientist': `MLOps and production ML increasingly important. Business acumen as important as technical skills. Real-time analytics in demand.`,
    'marketing': `Digital marketing dominates. AI content creation tools changing landscape. Performance marketing and attribution crucial.`,
    'default': `Market values adaptability, continuous learning, and cross-functional collaboration. Digital skills are table stakes across all roles.`
  }
  
  return trends[role?.toLowerCase()] || trends['default']
}

function getExperienceLevel(stage: string): string {
  const levels: { [key: string]: string } = {
    'student': `Entry-level focus: Build portfolio projects, gain internship experience, develop network through informational interviews.`,
    'early': `Early career focus: Deepen technical skills, seek mentorship, take on stretch projects, build personal brand.`,
    'mid': `Mid-career focus: Develop leadership skills, specialize in high-value areas, expand network strategically, consider lateral moves.`,
    'senior': `Senior level focus: Executive presence, strategic thinking, team building, industry thought leadership.`,
    'transition': `Career transition focus: Transferable skills identification, strategic networking, potential salary adjustments, timeline management.`
  }
  
  return levels[stage] || levels['transition']
}

function calculateConfidenceScore(careerGoals: Record<string, unknown>, profile: Record<string, unknown>): number {
  let score = 50 // Base score
  
  if (careerGoals.target_role && careerGoals.target_role.length > 5) score += 15
  if (careerGoals.current_situation && careerGoals.current_situation.length > 20) score += 15
  if (profile?.current_role) score += 10
  if (profile?.location) score += 5
  if (careerGoals.target_industry) score += 5
  
  return Math.min(score, 95)
}

function getNextReviewDate(timeline: string): string {
  const dates: { [key: string]: number } = {
    'immediate': 14,
    'short': 30, 
    'medium': 60,
    'long': 90
  }
  
  const days = dates[timeline] || 30
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + days)
  
  return nextDate.toISOString().split('T')[0]
}

function getPersonalizationFactors(careerGoals: Record<string, unknown>, profile: Record<string, unknown>): string[] {
  const factors = []
  
  if (careerGoals.work_preference === 'remote') factors.push('Remote work preference')
  if (careerGoals.timeline === 'immediate') factors.push('Urgent timeline')
  if (profile?.location?.includes('San Francisco') || profile?.location?.includes('New York')) {
    factors.push('Major tech hub location')
  }
  if (careerGoals.career_stage === 'senior') factors.push('Senior level experience')
  
  return factors
}