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

  const { resumeText } = req.body

  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required' })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a professional career coach and resume expert. Analyze this resume and provide:

1. An overall score out of 100
2. Key strengths (3-5 points)
3. Areas for improvement (3-5 points)
4. Specific actionable recommendations (3-5 points)

Please respond in JSON format with this structure:
{
  "score": number,
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}

Resume text:
${resumeText}`
        }
      ]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return res.status(200).json(analysis)
      }
    }

    throw new Error('Failed to parse AI response')
  } catch (error: any) {
    console.error('Error analyzing resume:', error)
    return res.status(500).json({ error: 'Failed to analyze resume' })
  }
}