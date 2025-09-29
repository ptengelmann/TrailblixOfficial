import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ProgressSummary, CareerMilestone, UserActivity } from '@/types/progress'
import { logger } from '@/lib/logger'
import {
  TrendingUp, TrendingDown, Target,
  Award, AlertTriangle, CheckCircle, Zap,
  Users, BarChart3, ArrowUp, ArrowDown
} from 'lucide-react'
import Link from 'next/link'

interface ProgressWidgetsProps {
  userId: string
}

export default function ProgressWidgets({ userId }: ProgressWidgetsProps) {
  const [progressData, setProgressData] = useState<ProgressSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId) {
      loadProgressData()
    }
  }, [userId])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        logger.info('No active session, skipping progress data load', 'COMPONENT', { component: 'ProgressWidgets' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/career-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'get_summary'
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('Progress API request failed', 'API', { status: response.status, error: errorData, userId })

        if (response.status === 401) {
          logger.warn('Authentication issue detected, user may need to log in again', 'AUTH', { userId, status: response.status })
          setError('Authentication required')
          return
        }

        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setProgressData(result.data)
      } else {
        logger.info('No progress data available yet', 'COMPONENT', { userId, component: 'ProgressWidgets' })
        setProgressData(null)
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to load progress data', 'COMPONENT', { userId, component: 'ProgressWidgets', error: errorMessage })
      setError('Unable to load progress data at this time')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error && error !== 'Unable to load progress data at this time') {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="text-red-600 dark:text-red-500" size={20} />
          <h3 className="text-red-800 dark:text-red-400 font-medium">Authentication Required</h3>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm">
          Please log in to view your career progress.
        </p>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="text-slate-600 dark:text-slate-400" size={20} />
          <h3 className="text-slate-800 dark:text-slate-400 font-medium">Start Your Progress Journey</h3>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">
          Complete some career activities to see your progress tracking here.
        </p>
        <div className="flex gap-2">
          <Link
            href="/jobs"
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Search Jobs
          </Link>
          <button
            onClick={loadProgressData}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const getMomentumColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-500'
    if (score >= 60) return 'text-blue-600 dark:text-blue-500'
    if (score >= 40) return 'text-amber-600 dark:text-amber-500'
    return 'text-red-600 dark:text-red-500'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="text-green-600 dark:text-green-500" size={20} />
      case 'declining': return <TrendingDown className="text-red-600 dark:text-red-500" size={20} />
      default: return <BarChart3 className="text-blue-600 dark:text-blue-500" size={20} />
    }
  }

  const formatPerformanceDelta = (delta: number) => {
    const isPositive = delta > 0
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {Math.abs(delta).toFixed(0)}% vs peers
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Weekly Momentum Score */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="text-blue-600 dark:text-blue-500" size={20} />
            Weekly Momentum
          </h3>
          {getTrendIcon(progressData.momentum_trend)}
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-4xl font-bold ${getMomentumColor(progressData.current_week.momentum_score)}`}>
            {progressData.current_week.momentum_score}
          </div>
          <div className="flex-1">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  progressData.current_week.momentum_score >= 80 ? 'bg-green-500' :
                  progressData.current_week.momentum_score >= 60 ? 'bg-blue-500' :
                  progressData.current_week.momentum_score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(progressData.current_week.momentum_score, 100)}%` }}
              ></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {progressData.momentum_trend === 'improving' ? 'Momentum building!' :
               progressData.momentum_trend === 'declining' ? 'Momentum declining' : 'Steady progress'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600 dark:text-slate-400">This week:</span>
            <div className="font-medium text-slate-900 dark:text-white">
              {progressData.current_week.applications_count} applications
            </div>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Streak:</span>
            <div className="font-medium text-slate-900 dark:text-white">
              {progressData.weekly_streak} weeks
            </div>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="text-blue-600 dark:text-blue-500" size={20} />
            Goal Progress
          </h3>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            {progressData.current_week.goal_progress_percentage}%
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressData.current_week.goal_progress_percentage, 100)}%` }}
          ></div>
        </div>

        <div className="space-y-3">
          {progressData.next_milestones.slice(0, 2).map((milestone: CareerMilestone) => (
            <div key={milestone.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{milestone.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-20 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((milestone.current_value / milestone.target_value) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {milestone.current_value}/{milestone.target_value}
                  </span>
                </div>
              </div>
              {new Date(milestone.target_date) < new Date() && (
                <AlertTriangle className="text-amber-600 dark:text-amber-500 ml-2" size={16} />
              )}
            </div>
          ))}
        </div>

        {progressData.next_milestones.length > 2 && (
          <div className="mt-3 text-center">
            <Link href="/profile" className="text-blue-600 dark:text-blue-500 text-sm hover:underline">
              View all milestones →
            </Link>
          </div>
        )}
      </div>

      {/* Performance vs Peers */}
      {progressData.benchmark_comparison && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Users className="text-blue-600 dark:text-blue-500" size={20} />
            Performance vs Peers
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Applications</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  You: {progressData.benchmark_comparison.your_performance.applications_per_week}/week
                </div>
              </div>
              {formatPerformanceDelta(progressData.benchmark_comparison.performance_delta.applications)}
            </div>

            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Response Rate</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Peer avg: {progressData.benchmark_comparison.peer_average.response_rate}%
                </div>
              </div>
              {formatPerformanceDelta(progressData.benchmark_comparison.performance_delta.response_rate)}
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {progressData.ai_recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-4">
            <Award className="text-blue-600 dark:text-blue-500" size={20} />
            This Week&apos;s Focus
          </h3>
          
          <div className="space-y-3">
            {progressData.ai_recommendations.slice(0, 3).map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                  {index + 1}
                </div>
                <p className="text-blue-700 dark:text-blue-200 text-sm flex-1">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <Link href="/career-coach" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
              Get detailed career strategy →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center gap-2 mb-4">
          <CheckCircle className="text-green-600 dark:text-green-500" size={20} />
          Recent Activity
        </h3>
        
        <div className="space-y-3">
          {progressData.recent_activities.slice(0, 4).map((activity: UserActivity) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 dark:text-green-200 text-sm">
                  {activity.activity_type.replace('_', ' ')} 
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                  +{activity.points_earned} points
                </span>
                <span className="text-green-600 dark:text-green-500 text-xs">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}