// Activity Tracking System
// Tracks all user actions and saves them to database for analytics and engagement

import { supabase } from './supabase'
import { logger } from './logger'

export type ActivityType =
  // Profile & Setup
  | 'profile_created'
  | 'profile_updated'
  | 'career_goals_set'
  | 'onboarding_completed'

  // Resume
  | 'resume_uploaded'
  | 'resume_analyzed'
  | 'resume_score_improved'

  // Jobs
  | 'job_searched'
  | 'job_viewed'
  | 'job_saved'
  | 'job_unsaved'
  | 'job_applied'
  | 'application_status_updated'

  // Intelligence & AI
  | 'intelligence_dashboard_viewed'
  | 'market_intelligence_generated'
  | 'career_prediction_generated'
  | 'salary_intelligence_generated'
  | 'ai_coach_message_sent'
  | 'ai_insight_viewed'

  // Career Progress
  | 'milestone_created'
  | 'milestone_completed'
  | 'milestone_updated'
  | 'daily_task_completed'
  | 'progress_tracked'

  // Networking
  | 'networking_contact_added'
  | 'networking_interaction_logged'
  | 'networking_goal_set'

  // Engagement
  | 'page_viewed'
  | 'feature_used'
  | 'settings_updated'
  | 'notification_clicked'
  | 'share_action'

export interface ActivityData {
  [key: string]: any
}

export interface TrackActivityParams {
  userId: string
  activityType: ActivityType
  activityData?: ActivityData
  metadata?: {
    page?: string
    source?: string
    campaign?: string
    [key: string]: any
  }
}

class ActivityTracker {
  private static instance: ActivityTracker
  private queue: TrackActivityParams[] = []
  private isProcessing = false

  private constructor() {
    // Flush queue every 5 seconds
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushQueue(), 5000)
    }
  }

  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker()
    }
    return ActivityTracker.instance
  }

  /**
   * Track a user activity
   */
  public async track(params: TrackActivityParams): Promise<void> {
    // Add to queue for batch processing
    this.queue.push(params)

    // If queue is large, flush immediately
    if (this.queue.length >= 10) {
      await this.flushQueue()
    }
  }

  /**
   * Track multiple activities at once
   */
  public async trackBatch(activities: TrackActivityParams[]): Promise<void> {
    this.queue.push(...activities)
    await this.flushQueue()
  }

  /**
   * Flush the queue and save to database
   */
  private async flushQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    const itemsToProcess = [...this.queue]
    this.queue = []

    try {
      // Save to progress_tracking table
      const records = itemsToProcess.map(item => ({
        user_id: item.userId,
        activity_type: item.activityType,
        activity_data: item.activityData || {},
        metadata: item.metadata || {},
        created_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('progress_tracking')
        .insert(records)

      if (error) {
        logger.error('Failed to save activity tracking', 'ACTIVITY_TRACKER', {
          error: error.message,
          count: records.length
        })
        // Re-add to queue if failed
        this.queue.unshift(...itemsToProcess)
      } else {
        logger.info('Activity tracking saved', 'ACTIVITY_TRACKER', {
          count: records.length
        })
      }
    } catch (error) {
      logger.error('Activity tracking error', 'ACTIVITY_TRACKER', { error })
      // Re-add to queue if failed
      this.queue.unshift(...itemsToProcess)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Track page view
   */
  public async trackPageView(userId: string, page: string, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      userId,
      activityType: 'page_viewed',
      activityData: { page },
      metadata
    })
  }

  /**
   * Track feature usage
   */
  public async trackFeatureUsage(
    userId: string,
    feature: string,
    action: string,
    data?: Record<string, any>
  ): Promise<void> {
    await this.track({
      userId,
      activityType: 'feature_used',
      activityData: {
        feature,
        action,
        ...data
      }
    })
  }

  /**
   * Get user activity stats
   */
  public async getUserStats(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('progress_tracking')
      .select('activity_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (error) {
      logger.error('Failed to fetch user stats', 'ACTIVITY_TRACKER', { error: error.message })
      return null
    }

    // Aggregate by activity type
    const stats: Record<string, number> = {}
    data?.forEach(item => {
      stats[item.activity_type] = (stats[item.activity_type] || 0) + 1
    })

    return {
      totalActivities: data?.length || 0,
      activitiesByType: stats,
      period: `${days} days`
    }
  }

  /**
   * Get activity streak (consecutive days)
   */
  public async getActivityStreak(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(365) // Check last year

    if (error || !data || data.length === 0) {
      return 0
    }

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const uniqueDays = new Set<string>()
    data.forEach(item => {
      const date = new Date(item.created_at)
      date.setHours(0, 0, 0, 0)
      uniqueDays.add(date.toISOString())
    })

    const sortedDays = Array.from(uniqueDays).sort().reverse()

    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = new Date(sortedDays[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - streak)
      expectedDate.setHours(0, 0, 0, 0)

      if (dayDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }
}

// Export singleton instance
export const activityTracker = ActivityTracker.getInstance()

// Helper functions for common tracking scenarios
export const trackActivity = (params: TrackActivityParams) => activityTracker.track(params)

export const trackPageView = (userId: string, page: string, metadata?: Record<string, any>) =>
  activityTracker.trackPageView(userId, page, metadata)

export const trackFeatureUsage = (userId: string, feature: string, action: string, data?: Record<string, any>) =>
  activityTracker.trackFeatureUsage(userId, feature, action, data)

export const getUserActivityStats = (userId: string, days?: number) =>
  activityTracker.getUserStats(userId, days)

export const getActivityStreak = (userId: string) =>
  activityTracker.getActivityStreak(userId)