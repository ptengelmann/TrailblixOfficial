import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

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

  const { careerGoals, profile } = req.body

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are a career coach. Based on this person's career goals and profile, provide 3-5 specific, actionable recommendations.

Career Goals:
- Career Stage: ${careerGoals.career_stage}
- Primary Goal: ${careerGoals.primary_goal}
- Target Role: ${careerGoals.target_role}
- Timeline: ${careerGoals.timeline}
- Work Preference: ${careerGoals.work_preference}
- Current Situation: ${careerGoals.current_situation}

Current Profile:
- Current Role: ${profile?.current_role || 'Not specified'}
- Location: ${profile?.location || 'Not specified'}

Respond with JSON:
{
  "recommendations": [
    "Specific action 1",
    "Specific action 2",
    ...
  ]
}`
        }
      ]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        return res.status(200).json(data)
      }
    }

    throw new Error('Failed to parse AI response')
  } catch (error: any) {
    console.error('Error generating recommendations:', error)
    return res.status(500).json({ error: 'Failed to generate recommendations' })
  }
}