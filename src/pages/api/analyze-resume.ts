// src/pages/api/analyze-resume.ts
// Enhanced Skills Intelligence Engine - Core differentiator for Traiblix

import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface SkillsIntelligence {
  extracted_skills: {
    technical: Array<{
      skill: string
      confidence: number
      category: string
      years_experience?: number
      proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    }>
    soft: Array<{
      skill: string
      confidence: number
      evidence: string[]
    }>
    industry_specific: Array<{
      skill: string
      confidence: number
      industry: string
    }>
    certifications: Array<{
      name: string
      issuer: string
      year?: number
      status: 'active' | 'expired' | 'unknown'
    }>
  }
  skill_gaps: {
    missing_for_target_role: Array<{
      skill: string
      importance: 'critical' | 'important' | 'nice_to_have'
      market_demand: number
      learning_resources: string[]
    }>
    outdated_skills: Array<{
      skill: string
      current_relevance: number
      modernization_path: string
    }>
  }
  market_intelligence: {
    skills_demand_analysis: Array<{
      skill: string
      demand_trend: 'rising' | 'stable' | 'declining'
      demand_score: number
      salary_impact: number
      job_market_growth: string
    }>
    competitive_positioning: {
      percentile_ranking: number
      similar_profiles_comparison: string
      unique_differentiators: string[]
    }
  }
  career_progression: {
    suggested_next_roles: Array<{
      title: string
      skills_alignment: number
      skills_needed: string[]
      timeline_estimate: string
    }>
    skill_development_priorities: Array<{
      skill: string
      priority_score: number
      learning_path: {
        beginner: string[]
        intermediate: string[]
        advanced: string[]
      }
      estimated_time_to_proficiency: string
    }>
  }
  overall_assessment: {
    marketability_score: number
    strengths: string[]
    improvement_areas: string[]
    strategic_recommendations: string[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { resumeText, targetRole, careerStage, industryFocus } = req.body

  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required' })
  }

  try {
    // Get user's career context from the token
    const token = req.headers.authorization?.replace('Bearer ', '')
    let userContext = null
    
    if (token) {
      try {
        const supabase = createClient(
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

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const [profileResult, objectivesResult] = await Promise.all([
            supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
            supabase.from('career_objectives').select('*').eq('user_id', user.id).single()
          ])
          
          userContext = {
            profile: profileResult.data,
            objectives: objectivesResult.data
          }
        }
      } catch (error) {
        console.log('Could not load user context, proceeding with basic analysis')
      }
    }

    const skillsAnalysis = await analyzeSkillsWithAI(
      resumeText, 
      targetRole || userContext?.objectives?.target_role,
      careerStage || userContext?.objectives?.career_stage,
      industryFocus || userContext?.objectives?.target_industry,
      userContext
    )

    // Return the enhanced analysis with backward compatibility
    return res.status(200).json({
      // Legacy fields for backward compatibility
      score: skillsAnalysis.overall_assessment.marketability_score,
      strengths: skillsAnalysis.overall_assessment.strengths,
      improvements: skillsAnalysis.overall_assessment.improvement_areas,
      recommendations: skillsAnalysis.overall_assessment.strategic_recommendations,
      
      // Enhanced intelligence data
      ...skillsAnalysis
    })
  } catch (error: any) {
    console.error('Error in enhanced skills analysis:', error)
    return res.status(500).json({ error: 'Failed to analyze skills' })
  }
}

async function analyzeSkillsWithAI(
  resumeText: string,
  targetRole?: string,
  careerStage?: string,
  industryFocus?: string,
  userContext?: any
): Promise<SkillsIntelligence> {
  
  const prompt = `You are an elite career strategist and skills intelligence expert with deep knowledge of current job markets across all industries. Perform a comprehensive skills analysis of this resume.

CONTEXT:
- Target Role: ${targetRole || 'Not specified'}
- Career Stage: ${careerStage || 'Not specified'}
- Industry Focus: ${industryFocus || 'Not specified'}
- Current Year: 2025

ANALYSIS REQUIREMENTS:
1. Extract ALL skills with high precision - technical, soft skills, certifications
2. Assess market demand for each skill based on 2025 job market trends
3. Identify critical skill gaps for the target role
4. Provide strategic learning recommendations
5. Predict career trajectory based on current skill set

RESUME TEXT:
${resumeText}

MARKET INTELLIGENCE CONTEXT (2025):
- AI/ML skills are in extreme high demand across all industries
- Cloud platforms (AWS, Azure, GCP) are essential for technical roles
- Soft skills like emotional intelligence and cross-functional collaboration are increasingly valued
- Industry 4.0 technologies (IoT, blockchain, cybersecurity) are growing rapidly
- Remote work skills and digital collaboration tools are now baseline requirements
- Data analysis and visualization skills are crucial across non-technical roles
- Sustainability and ESG knowledge is becoming important in many sectors

Respond with this EXACT JSON structure (no additional text):
{
  "extracted_skills": {
    "technical": [
      {
        "skill": "Python",
        "confidence": 95,
        "category": "Programming Language",
        "years_experience": 3,
        "proficiency_level": "advanced"
      }
    ],
    "soft": [
      {
        "skill": "Leadership",
        "confidence": 85,
        "evidence": ["Led team of 5 developers", "Managed cross-functional projects"]
      }
    ],
    "industry_specific": [
      {
        "skill": "Financial Modeling",
        "confidence": 80,
        "industry": "Finance"
      }
    ],
    "certifications": [
      {
        "name": "AWS Solutions Architect",
        "issuer": "Amazon",
        "year": 2023,
        "status": "active"
      }
    ]
  },
  "skill_gaps": {
    "missing_for_target_role": [
      {
        "skill": "Machine Learning",
        "importance": "critical",
        "market_demand": 95,
        "learning_resources": ["Coursera ML Specialization", "Kaggle Learn", "Fast.ai"]
      }
    ],
    "outdated_skills": [
      {
        "skill": "jQuery",
        "current_relevance": 30,
        "modernization_path": "Learn React or Vue.js for modern frontend development"
      }
    ]
  },
  "market_intelligence": {
    "skills_demand_analysis": [
      {
        "skill": "Python",
        "demand_trend": "rising",
        "demand_score": 92,
        "salary_impact": 15,
        "job_market_growth": "25% year-over-year growth in Python roles"
      }
    ],
    "competitive_positioning": {
      "percentile_ranking": 75,
      "similar_profiles_comparison": "Above average technical skills, needs improvement in leadership experience",
      "unique_differentiators": ["Rare combination of technical and domain expertise", "International experience"]
    }
  },
  "career_progression": {
    "suggested_next_roles": [
      {
        "title": "Senior Software Engineer",
        "skills_alignment": 85,
        "skills_needed": ["System Design", "Mentoring", "Architecture"],
        "timeline_estimate": "6-12 months with focused skill development"
      }
    ],
    "skill_development_priorities": [
      {
        "skill": "Machine Learning",
        "priority_score": 95,
        "learning_path": {
          "beginner": ["Python basics", "Statistics fundamentals", "Pandas/NumPy"],
          "intermediate": ["Scikit-learn", "Feature engineering", "Model evaluation"],
          "advanced": ["Deep learning", "MLOps", "Production deployment"]
        },
        "estimated_time_to_proficiency": "4-6 months intensive study"
      }
    ]
  },
  "overall_assessment": {
    "marketability_score": 78,
    "strengths": ["Strong technical foundation", "Proven track record", "Industry experience"],
    "improvement_areas": ["Leadership skills", "Modern frameworks", "Communication skills"],
    "strategic_recommendations": [
      "Focus on ML/AI skills for next 6 months - highest ROI",
      "Gain team leadership experience through side projects or volunteering",
      "Build a portfolio showcasing your best technical work",
      "Network with professionals in target companies through LinkedIn and industry events"
    ]
  }
}`

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
        return JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        throw new Error('Failed to parse AI response')
      }
    }
  }

  throw new Error('Invalid AI response format')
}