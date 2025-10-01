// Subscription and rate limiting middleware for API routes

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  getUserSubscription,
  hasFeatureAccess,
  checkUsageLimit,
  incrementUsage,
  checkRateLimit,
  type SubscriptionLimits
} from '@/lib/subscription'

export interface SubscriptionCheckOptions {
  feature?: keyof SubscriptionLimits
  resourceType?: string
  rateLimitMax?: number
  rateLimitWindow?: number
  incrementUsageOnSuccess?: boolean
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string
    userId: string
    email?: string
  }
}

/**
 * Authenticate user from bearer token
 */
export async function authenticateUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ id: string; userId: string; email?: string } | null> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required'
    })
    return null
  }

  try {
    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Please log in again'
      })
      return null
    }

    return { id: user.id, userId: user.id, email: user.email }
  } catch (error) {
    logger.error('Authentication error', 'AUTH', { error })
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    })
    return null
  }
}

/**
 * Check if user has subscription access to a feature
 */
export async function checkSubscriptionAccess(
  userId: string,
  res: NextApiResponse,
  options: SubscriptionCheckOptions
): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId)

    // Check feature access
    if (options.feature) {
      const hasAccess = hasFeatureAccess(subscription, options.feature)

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: 'Feature not available',
          message: `This feature requires a Pro subscription. Upgrade to unlock ${options.feature.replace(/_/g, ' ')}.`,
          code: 'FEATURE_LOCKED',
          upgradeUrl: '/pricing',
          currentPlan: subscription.planId
        })
        return false
      }
    }

    // Check usage limits
    if (options.resourceType) {
      const { exceeded, current, limit } = await checkUsageLimit(userId, options.resourceType)

      if (exceeded) {
        res.status(429).json({
          success: false,
          error: 'Usage limit exceeded',
          message: `You've reached your monthly limit of ${limit} ${options.resourceType.replace(/_/g, ' ')}. Upgrade to Pro for unlimited access.`,
          code: 'USAGE_LIMIT_EXCEEDED',
          usage: { current, limit },
          upgradeUrl: '/pricing',
          currentPlan: subscription.planId
        })
        return false
      }
    }

    return true
  } catch (error) {
    logger.error('Subscription check error', 'SUBSCRIPTION', { userId, error })
    // Allow access on error to prevent blocking users
    return true
  }
}

/**
 * Check API rate limit
 */
export async function checkApiRateLimit(
  userId: string,
  endpoint: string,
  res: NextApiResponse,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const exceeded = await checkRateLimit(userId, endpoint, maxRequests, windowSeconds)

    if (exceeded) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Please wait ${windowSeconds} seconds before trying again.`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: windowSeconds
      })
      return false
    }

    return true
  } catch (error) {
    logger.error('Rate limit check error', 'RATE_LIMIT', { userId, endpoint, error })
    // Allow request on error
    return true
  }
}

/**
 * Middleware wrapper for protected API routes
 */
export function withSubscription(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  options: SubscriptionCheckOptions = {}
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Authenticate user
      const auth = await authenticateUser(req, res)
      if (!auth) return // Response already sent

      req.user = auth

      // Check rate limit first (applies to all users)
      const endpoint = req.url || 'unknown'
      const rateLimitPassed = await checkApiRateLimit(
        auth.userId,
        endpoint,
        res,
        options.rateLimitMax,
        options.rateLimitWindow
      )
      if (!rateLimitPassed) return // Response already sent

      // Check subscription access
      const subscriptionPassed = await checkSubscriptionAccess(auth.userId, res, options)
      if (!subscriptionPassed) return // Response already sent

      // Increment usage if requested
      if (options.incrementUsageOnSuccess && options.resourceType) {
        await incrementUsage(auth.userId, options.resourceType)
      }

      // Call the actual handler
      await handler(req, res)

      // Increment usage after successful completion if not already incremented
      if (!options.incrementUsageOnSuccess && options.resourceType) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await incrementUsage(auth.userId, options.resourceType)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('API middleware error', 'MIDDLEWARE', { error: errorMessage })

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }
}

/**
 * Simple authentication-only middleware
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withSubscription(handler, {})
}

/**
 * Middleware for AI-powered endpoints (Pro feature with usage tracking)
 */
export function withAIAccess(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  resourceType: string = 'ai_insights_per_month'
) {
  return withSubscription(handler, {
    resourceType,
    rateLimitMax: 20, // 20 requests per minute for AI endpoints
    rateLimitWindow: 60
  })
}

/**
 * Middleware for Pro-only features
 */
export function withProAccess(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  feature: keyof SubscriptionLimits
) {
  return withSubscription(handler, {
    feature,
    rateLimitMax: 30,
    rateLimitWindow: 60
  })
}
