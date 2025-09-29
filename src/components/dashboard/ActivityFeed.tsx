// Activity Feed - Show recent career activities with insights and momentum
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { UserActivity } from '@/types/progress'
import { logger } from '@/lib/logger'
import {
  Activity, TrendingUp, Users, Search, Send,
  Star, CheckCircle, Zap, Award,
  Briefcase, Target, Clock
} from 'lucide-react'

interface ActivityWithJobData extends UserActivity {
  activity_data: {
    job_data?: {
      title?: string
      company?: {
        display_name?: string
      }
    }
    description?: string
    task_type?: string
    points_earned?: number
    [key: string]: unknown
  }
}

interface ActivityStats {
  this_week: number
  last_week: number
  momentum_trend: 'up' | 'down' | 'stable'
  streak_count: number
  top_activity: string
}

export default function ActivityFeed() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityWithJobData[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadRecentActivities()
      loadActivityStats()
    }
  }, [user])

  const loadRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to load user activities', 'DATABASE', { userId: user?.id, error: errorMessage, component: 'ActivityFeed' })
    }
  }

  const loadActivityStats = async () => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

      const [thisWeekData, lastWeekData] = await Promise.all([
        supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', twoWeeksAgo.toISOString())
          .lt('created_at', weekAgo.toISOString())
      ])

      const thisWeekCount = thisWeekData.data?.length || 0
      const lastWeekCount = lastWeekData.data?.length || 0

      // Calculate top activity type
      const activityCounts = thisWeekData.data?.reduce((acc: Record<string, number>, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
        return acc
      }, {})

      const topActivity = Object.entries(activityCounts || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))
        [0]?.[0] || 'job_applied'

      // Calculate momentum trend
      let momentum: 'up' | 'down' | 'stable' = 'stable'
      if (thisWeekCount > lastWeekCount * 1.1) momentum = 'up'
      else if (thisWeekCount < lastWeekCount * 0.9) momentum = 'down'

      // Calculate streak (days with activity)
      const streakCount = calculateActivityStreak(thisWeekData.data || [])

      setStats({
        this_week: thisWeekCount,
        last_week: lastWeekCount,
        momentum_trend: momentum,
        streak_count: streakCount,
        top_activity: topActivity
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to load activity statistics', 'DATABASE', { userId: user?.id, error: errorMessage, component: 'ActivityFeed' })
    } finally {
      setLoading(false)
    }
  }

  const calculateActivityStreak = (activities: UserActivity[]): number => {
    const uniqueDays = new Set()
    activities.forEach(activity => {
      const day = activity.created_at.split('T')[0]
      uniqueDays.add(day)
    })
    return uniqueDays.size
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
      'job_applied': Send,
      'job_saved': Star,
      'job_viewed': Search,
      'networking_activity': Users,
      'daily_task_completed': CheckCircle,
      'resume_updated': Briefcase,
      'skill_learned': TrendingUp,
      'goal_set': Target,
      'profile_updated': Activity
    }
    return icons[type] || Activity
  }

  const getActivityMessage = (activity: ActivityWithJobData): string => {
    const { activity_type, activity_data } = activity

    const messages: Record<string, string> = {
      'job_applied': `Applied to ${activity_data?.job_data?.title || 'a position'} at ${activity_data?.job_data?.company?.display_name || 'a company'}`,
      'job_saved': `Saved ${activity_data?.job_data?.title || 'a job'} for later`,
      'job_viewed': `Viewed ${activity_data?.job_data?.title || 'a job opportunity'}`,
      'networking_activity': `${activity_data?.description || 'Completed networking activity'}`,
      'daily_task_completed': `Completed daily task: ${activity_data?.task_type || 'career task'}`,
      'resume_updated': 'Updated resume and skills profile',
      'skill_learned': 'Added new skills to profile',
      'goal_set': 'Set new career goals',
      'profile_updated': 'Updated career profile'
    }

    return messages[activity_type] || 'Career activity completed'
  }

  const getActivityColor = (type: string): string => {
    const colors: Record<string, string> = {
      'job_applied': 'text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-950/50',
      'job_saved': 'text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-950/50',
      'job_viewed': 'text-purple-600 dark:text-purple-500 bg-purple-100 dark:bg-purple-950/50',
      'networking_activity': 'text-orange-600 dark:text-orange-500 bg-orange-100 dark:bg-orange-950/50',
      'daily_task_completed': 'text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-950/50',
      'resume_updated': 'text-indigo-600 dark:text-indigo-500 bg-indigo-100 dark:bg-indigo-950/50'
    }
    return colors[type] || 'text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-950/50'
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getMomentumIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="text-green-600" size={16} />
    if (trend === 'down') return <TrendingUp className="text-red-600 rotate-180" size={16} />
    return <Activity className="text-slate-600" size={16} />
  }

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Activity Feed
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your recent career activities
          </p>
        </div>

        {stats && (
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              {getMomentumIcon(stats.momentum_trend)}
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {stats.this_week} this week
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {stats.streak_count} active days
            </div>
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {stats.this_week}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">This Week</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={14} className="text-amber-600" />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {stats.streak_count}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {Math.round(((stats.this_week - stats.last_week) / Math.max(stats.last_week, 1)) * 100)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">vs Last Week</div>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No recent activities
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Complete some career tasks to see your activity here.
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.activity_type)
            const colorClass = getActivityColor(activity.activity_type)

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon size={16} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    {getActivityMessage(activity)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Clock size={12} />
                    {formatTimeAgo(activity.created_at)}
                    {activity.activity_data?.points_earned && (
                      <div className="flex items-center gap-1 ml-2">
                        <Star size={12} className="text-amber-600" />
                        <span className="text-amber-600">+{activity.activity_data.points_earned}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Motivational Footer */}
      {activities.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm">
            <Award className="text-blue-600" size={16} />
            <span className="font-medium text-slate-900 dark:text-white">
              Great momentum! Keep up the consistent career building.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}