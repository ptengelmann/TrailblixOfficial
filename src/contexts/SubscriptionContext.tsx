// Subscription Context - Provides subscription status throughout the app

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import type { UserSubscription, SubscriptionPlan } from '@/lib/subscription'
import { SUBSCRIPTION_PLANS, isProUser, isOnTrial } from '@/lib/subscription'

interface UsageStats {
  ai_insights: {
    current: number
    limit: number
    percentage: number
  }
}

interface SubscriptionContextType {
  subscription: UserSubscription | null
  plan: SubscriptionPlan | null
  usage: UsageStats | null
  loading: boolean
  isPro: boolean
  isTrial: boolean
  refetch: () => Promise<void>
  upgrade: (billingPeriod?: 'monthly' | 'annual') => Promise<{ success: boolean; error?: string }>
  cancel: () => Promise<{ success: boolean; error?: string }>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null)
      setPlan(null)
      setUsage(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()

      if (data.success) {
        setSubscription(data.subscription)
        const planId = data.subscription.planId as 'free' | 'pro'
        setPlan(data.subscription.planDetails || SUBSCRIPTION_PLANS[planId])
        setUsage(data.usage || null)
      }
    } catch (error) {
      logger.error('Failed to fetch subscription', 'SUBSCRIPTION', { error })
      // Set default free plan on error
      setSubscription({
        userId: user.id,
        planId: 'free',
        status: 'active',
        isTrial: false,
        limits: SUBSCRIPTION_PLANS.free.limits
      })
      setPlan(SUBSCRIPTION_PLANS.free)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [user])

  const upgrade = async (billingPeriod: 'monthly' | 'annual' = 'monthly') => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return { success: false, error: 'No active session' }
      }

      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'upgrade',
          billingPeriod,
          startTrial: true
        })
      })

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error || 'Upgrade failed' }
      }

      // Refresh subscription data
      await fetchSubscription()

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Upgrade failed', 'SUBSCRIPTION', { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const cancel = async () => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return { success: false, error: 'No active session' }
      }

      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'cancel',
          immediate: false
        })
      })

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error || 'Cancellation failed' }
      }

      // Refresh subscription data
      await fetchSubscription()

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Cancellation failed', 'SUBSCRIPTION', { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const value: SubscriptionContextType = {
    subscription,
    plan,
    usage,
    loading,
    isPro: subscription ? isProUser(subscription) : false,
    isTrial: subscription ? isOnTrial(subscription) : false,
    refetch: fetchSubscription,
    upgrade,
    cancel
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

// Hook to check if user has access to a specific feature
export function useFeatureAccess(feature: string): {
  hasAccess: boolean
  upgradeRequired: boolean
  currentPlan: string
} {
  const { subscription, loading } = useSubscription()

  if (loading || !subscription) {
    return {
      hasAccess: true, // Allow access while loading to prevent UI flicker
      upgradeRequired: false,
      currentPlan: 'free'
    }
  }

  // Map feature names to subscription limit keys
  const featureMap: Record<string, keyof typeof subscription.limits> = {
    'career_predictions': 'career_predictions',
    'skills_gap_analysis': 'skills_gap_analysis',
    'networking_tracker': 'networking_tracker',
    'daily_tasks': 'daily_tasks',
    'salary_forecasting': 'salary_forecasting',
    'career_path_mapping': 'career_path_mapping',
    'job_market_trends': 'job_market_trends',
    'priority_support': 'priority_support'
  }

  const limitKey = featureMap[feature]
  if (!limitKey) {
    return { hasAccess: true, upgradeRequired: false, currentPlan: subscription.planId }
  }

  const limit = subscription.limits[limitKey]

  // Boolean features
  if (typeof limit === 'boolean') {
    return {
      hasAccess: limit,
      upgradeRequired: !limit,
      currentPlan: subscription.planId
    }
  }

  // String features
  if (typeof limit === 'string') {
    return {
      hasAccess: limit !== 'none',
      upgradeRequired: limit === 'none',
      currentPlan: subscription.planId
    }
  }

  // Number features
  if (typeof limit === 'number') {
    return {
      hasAccess: limit !== 0,
      upgradeRequired: limit === 0,
      currentPlan: subscription.planId
    }
  }

  return { hasAccess: false, upgradeRequired: true, currentPlan: subscription.planId }
}
