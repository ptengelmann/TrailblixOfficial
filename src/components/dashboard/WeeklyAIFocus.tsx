// This Week's AI-Generated Focus
// Real AI-powered weekly goals from Claude analysis, not generic recommendations

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  Target, TrendingUp, CheckCircle, Lightbulb, Sparkles,
  Clock, ExternalLink, Loader2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface WeeklyFocus {
  main_goal: string
  why_this_matters: string
  success_metrics: Array<{
    metric: string
    current: number
    target: number
    unit: string
  }>
  daily_actions: string[]
  ai_confidence: number
}

export default function WeeklyAIFocus() {
  const { user } = useAuth()
  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocus | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user) {
      loadWeeklyFocus()
    }
  }, [user])

  const loadWeeklyFocus = async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/dashboard/unified-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setWeeklyFocus(result.data.weekly_focus)

        logger.info('Weekly focus loaded', 'COMPONENT', {
          goal: result.data.weekly_focus.main_goal,
          confidence: result.data.weekly_focus.ai_confidence
        })
      }

    } catch (error: any) {
      logger.error('Failed to load weekly focus', 'COMPONENT', { error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const toggleAction = (index: number) => {
    setCompletedActions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!weeklyFocus) return null

  const completionRate = weeklyFocus.success_metrics.length > 0
    ? weeklyFocus.success_metrics.reduce((sum, m) => {
        const progress = Math.min((m.current / m.target) * 100, 100)
        return sum + progress
      }, 0) / weeklyFocus.success_metrics.length
    : 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="text-indigo-600" size={20} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              This Week's Focus
            </h3>
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded">
              AI POWERED
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Updated weekly • {weeklyFocus.ai_confidence}% AI confidence
          </p>
        </div>
        <Link
          href="/intelligence"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          View Full Plan
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Main Goal */}
      <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              {weeklyFocus.main_goal}
            </h4>
            <div className="flex items-start gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Lightbulb size={14} className="mt-0.5 flex-shrink-0" />
              <p className="italic">{weeklyFocus.why_this_matters}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Metrics */}
      {weeklyFocus.success_metrics.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Success Metrics
            </h4>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {completionRate.toFixed(0)}% Complete
            </span>
          </div>
          <div className="space-y-3">
            {weeklyFocus.success_metrics.map((metric, index) => {
              const progress = Math.min((metric.current / metric.target) * 100, 100)

              return (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {metric.metric}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {metric.current} / {metric.target} {metric.unit}
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Daily Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={16} className="text-slate-600 dark:text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Daily Actions ({completedActions.size}/{weeklyFocus.daily_actions.length} done)
          </h4>
        </div>
        <div className="space-y-2">
          {weeklyFocus.daily_actions.map((action, index) => {
            const isCompleted = completedActions.has(index)

            return (
              <button
                key={index}
                onClick={() => toggleAction(index)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-md'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle size={18} className="text-green-600" fill="currentColor" />
                  ) : (
                    <div className="h-[18px] w-[18px] border-2 border-slate-400 rounded-full"></div>
                  )}
                </div>
                <span className={`text-sm ${
                  isCompleted
                    ? 'text-green-900 dark:text-green-100 line-through'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {action}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong>AI Analysis:</strong> This focus is generated from your comprehensive intelligence analysis and updates every Monday based on your progress
          </p>
        </div>
      </div>
    </div>
  )
}
