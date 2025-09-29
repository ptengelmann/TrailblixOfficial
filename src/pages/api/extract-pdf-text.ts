import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import pdf from 'pdf-parse'
import fs from 'fs'
import { logger } from '@/lib/logger'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable()
    const [fields, files] = await form.parse(req)
    
    const file = files.file?.[0]
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Read the PDF file
    const dataBuffer = fs.readFileSync(file.filepath)
    const data = await pdf(dataBuffer)
    
    return res.status(200).json({ text: data.text })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to extract PDF text', 'API', { error: errorMessage, fileName: files.file?.originalFilename })
    return res.status(500).json({ error: 'Failed to extract text from PDF' })
  }
}