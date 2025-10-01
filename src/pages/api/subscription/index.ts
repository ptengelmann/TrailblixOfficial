// API endpoint for subscription management

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  getUserSubscription,
  upgradeUserToPro,
  cancelSubscription,
  getUsageStats,
  SUBSCRIPTION_PLANS
} from '@/lib/subscription'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get user from auth header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' })
    }

    const userId = user.id

    if (req.method === 'GET') {
      // Get user's subscription details
      const subscription = await getUserSubscription(userId)
      const usageStats = await getUsageStats(userId)
      const plan = SUBSCRIPTION_PLANS[subscription.planId]

      return res.status(200).json({
        success: true,
        subscription: {
          ...subscription,
          planDetails: plan
        },
        usage: usageStats
      })
    }

    if (req.method === 'POST') {
      const { action, billingPeriod, startTrial } = req.body

      if (action === 'upgrade') {
        // Upgrade to Pro
        const result = await upgradeUserToPro(
          userId,
          billingPeriod || 'monthly',
          startTrial !== false // Default to true
        )

        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: result.error || 'Failed to upgrade subscription'
          })
        }

        // Get updated subscription
        const subscription = await getUserSubscription(userId)

        return res.status(200).json({
          success: true,
          message: 'Successfully upgraded to Pro',
          subscription
        })
      }

      if (action === 'cancel') {
        const { immediate } = req.body

        const result = await cancelSubscription(userId, immediate || false)

        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: result.error || 'Failed to cancel subscription'
          })
        }

        return res.status(200).json({
          success: true,
          message: immediate
            ? 'Subscription canceled immediately'
            : 'Subscription will be canceled at end of billing period'
        })
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "upgrade" or "cancel"'
      })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Subscription API error', 'API', { error: errorMessage })
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
