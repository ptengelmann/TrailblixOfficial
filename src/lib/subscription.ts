// Enterprise-grade subscription management and rate limiting

import { supabase } from './supabase'
import { logger } from './logger'

export type PlanId = 'free' | 'pro'

export interface SubscriptionPlan {
  id: PlanId
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  features: Record<string, boolean | string>
  limits: SubscriptionLimits
}

export interface SubscriptionLimits {
  ai_insights_per_month: number // -1 = unlimited
  career_predictions: boolean
  skills_gap_analysis: boolean
  networking_tracker: 'none' | 'limited' | 'full'
  daily_tasks: boolean
  salary_forecasting: 'none' | 'current_only' | '18_months'
  career_path_mapping: boolean
  job_market_trends: boolean
  priority_support: boolean
}

export interface UserSubscription {
  userId: string
  planId: PlanId
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  billingPeriod?: 'monthly' | 'annual'
  currentPeriodEnd?: Date
  isTrial: boolean
  trialEndsAt?: Date
  limits: SubscriptionLimits
}

// Default plans matching database
export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for exploring career options',
    priceMonthly: 0,
    priceAnnual: 0,
    features: {
      basic_job_search: true,
      basic_salary_data: true,
      simple_career_tracking: true,
      community_support: true
    },
    limits: {
      ai_insights_per_month: 5,
      career_predictions: false,
      skills_gap_analysis: false,
      networking_tracker: 'limited',
      daily_tasks: false,
      salary_forecasting: 'current_only',
      career_path_mapping: false,
      job_market_trends: false,
      priority_support: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious career growth',
    priceMonthly: 15,
    priceAnnual: 144,
    features: {
      unlimited_ai_insights: true,
      advanced_predictions: true,
      skills_gap_analysis: true,
      full_networking_tracker: true,
      daily_personalized_tasks: true,
      gamification: true,
      salary_forecasting_18m: true,
      career_path_mapping: true,
      job_market_trends: true,
      priority_support: true,
      early_access: true
    },
    limits: {
      ai_insights_per_month: -1, // unlimited
      career_predictions: true,
      skills_gap_analysis: true,
      networking_tracker: 'full',
      daily_tasks: true,
      salary_forecasting: '18_months',
      career_path_mapping: true,
      job_market_trends: true,
      priority_support: true
    }
  }
}

/**
 * Get user's subscription with limits
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  try {
    const { data, error } = await supabase.rpc('get_user_subscription', {
      p_user_id: userId
    })

    if (error) throw error

    if (!data || data.length === 0) {
      // Return free plan as default
      return {
        userId,
        planId: 'free',
        status: 'active',
        isTrial: false,
        limits: SUBSCRIPTION_PLANS.free.limits
      }
    }

    const sub = data[0]
    return {
      userId,
      planId: sub.plan_id as PlanId,
      status: sub.status,
      isTrial: sub.is_trial,
      trialEndsAt: sub.trial_ends_at ? new Date(sub.trial_ends_at) : undefined,
      limits: sub.limits
    }
  } catch (error) {
    logger.error('Failed to get user subscription', 'SUBSCRIPTION', { userId, error })
    // Return free plan on error for safety
    return {
      userId,
      planId: 'free',
      status: 'active',
      isTrial: false,
      limits: SUBSCRIPTION_PLANS.free.limits
    }
  }
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  subscription: UserSubscription,
  feature: keyof SubscriptionLimits
): boolean {
  const limit = subscription.limits[feature]

  // Boolean features
  if (typeof limit === 'boolean') {
    return limit
  }

  // String features (e.g., 'full', '18_months')
  if (typeof limit === 'string') {
    return limit !== 'none'
  }

  // Number features (-1 = unlimited, 0 = no access, >0 = limited access)
  if (typeof limit === 'number') {
    return limit !== 0
  }

  return false
}

/**
 * Check if user has exceeded usage limit
 */
export async function checkUsageLimit(
  userId: string,
  resourceType: string
): Promise<{ exceeded: boolean; current: number; limit: number }> {
  try {
    const { data: exceeded, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: userId,
      p_resource_type: resourceType
    })

    if (error) throw error

    // Get current usage
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)

    const { data: usageData } = await supabase
      .from('user_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .gte('period_start', periodStart.toISOString())
      .single()

    const current = usageData?.usage_count || 0

    // Get limit
    const subscription = await getUserSubscription(userId)
    const limitKey = resourceType as keyof SubscriptionLimits
    const limit = subscription.limits[limitKey]
    const numLimit = typeof limit === 'number' ? limit : 0

    return {
      exceeded: exceeded || false,
      current,
      limit: numLimit === -1 ? Infinity : numLimit
    }
  } catch (error) {
    logger.error('Failed to check usage limit', 'SUBSCRIPTION', { userId, resourceType, error })
    return { exceeded: false, current: 0, limit: 0 }
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  userId: string,
  resourceType: string,
  increment: number = 1
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_resource_type: resourceType,
      p_increment: increment
    })

    if (error) throw error

    return data || 0
  } catch (error) {
    logger.error('Failed to increment usage', 'SUBSCRIPTION', { userId, resourceType, error })
    return 0
  }
}

/**
 * Check API rate limit
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const { data: exceeded, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds
    })

    if (error) throw error

    return exceeded || false
  } catch (error) {
    logger.error('Failed to check rate limit', 'RATE_LIMIT', { userId, endpoint, error })
    return false
  }
}

/**
 * Upgrade user to Pro
 */
export async function upgradeUserToPro(
  userId: string,
  billingPeriod: 'monthly' | 'annual' = 'monthly',
  startTrial: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const trialEnd = startTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null // 14 days

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: 'pro',
        status: startTrial ? 'trialing' : 'active',
        billing_period: billingPeriod,
        trial_start: startTrial ? new Date().toISOString() : null,
        trial_end: trialEnd?.toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) throw error

    // Log event
    await supabase.from('subscription_events').insert({
      user_id: userId,
      event_type: 'upgraded',
      old_plan_id: 'free',
      new_plan_id: 'pro',
      metadata: { billing_period: billingPeriod, trial: startTrial }
    })

    logger.info('User upgraded to Pro', 'SUBSCRIPTION', { userId, billingPeriod, trial: startTrial })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to upgrade user', 'SUBSCRIPTION', { userId, error: errorMessage })
    return { success: false, error: errorMessage }
  }
}

/**
 * Cancel user subscription
 */
export async function cancelSubscription(userId: string, cancelImmediately: boolean = false): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: cancelImmediately ? 'canceled' : 'active',
        cancel_at_period_end: !cancelImmediately
      })
      .eq('user_id', userId)

    if (error) throw error

    // Log event
    await supabase.from('subscription_events').insert({
      user_id: userId,
      event_type: 'canceled',
      metadata: { immediate: cancelImmediately }
    })

    logger.info('User canceled subscription', 'SUBSCRIPTION', { userId, immediate: cancelImmediately })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to cancel subscription', 'SUBSCRIPTION', { userId, error: errorMessage })
    return { success: false, error: errorMessage }
  }
}

/**
 * Get usage statistics for the current period
 */
export async function getUsageStats(userId: string): Promise<Record<string, { current: number; limit: number; percentage: number }>> {
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  try {
    const { data: usageData } = await supabase
      .from('user_usage')
      .select('resource_type, usage_count')
      .eq('user_id', userId)
      .gte('period_start', periodStart.toISOString())

    const subscription = await getUserSubscription(userId)
    const stats: Record<string, { current: number; limit: number; percentage: number }> = {}

    // AI Insights
    const aiUsage = usageData?.find(u => u.resource_type === 'ai_insights_per_month')
    const aiLimit = subscription.limits.ai_insights_per_month
    stats.ai_insights = {
      current: aiUsage?.usage_count || 0,
      limit: aiLimit === -1 ? Infinity : aiLimit,
      percentage: aiLimit === -1 ? 0 : ((aiUsage?.usage_count || 0) / aiLimit) * 100
    }

    return stats
  } catch (error) {
    logger.error('Failed to get usage stats', 'SUBSCRIPTION', { userId, error })
    return {}
  }
}

/**
 * Check if user is on Pro plan
 */
export function isProUser(subscription: UserSubscription): boolean {
  return subscription.planId === 'pro' && subscription.status === 'active'
}

/**
 * Check if user is on trial
 */
export function isOnTrial(subscription: UserSubscription): boolean {
  return subscription.isTrial && subscription.status === 'trialing'
}
