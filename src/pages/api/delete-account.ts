// src/pages/api/delete-account.ts
// API route to handle complete account deletion with all user data cleanup

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // You'll need to add this to .env
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid session' })
    }

    // Delete user data in order (respecting foreign key constraints)
    const userId = user.id

    // 1. Delete resumes (and files from storage)
    const { data: resumes } = await supabase
      .from('resumes')
      .select('file_url')
      .eq('user_id', userId)

    if (resumes) {
      for (const resume of resumes) {
        // Extract file path from URL and delete from storage
        const filePath = resume.file_url.split('/').slice(-2).join('/')
        await supabase.storage.from('resumes').remove([filePath])
      }
    }

    await supabase.from('resumes').delete().eq('user_id', userId)

    // 2. Delete career objectives
    await supabase.from('career_objectives').delete().eq('user_id', userId)

    // 3. Delete user profile
    await supabase.from('user_profiles').delete().eq('user_id', userId)

    // 4. Delete the auth user (this is the final step)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      throw deleteError
    }

    return res.status(200).json({ message: 'Account deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting account:', error)
    return res.status(500).json({ error: 'Failed to delete account', details: error.message })
  }
}