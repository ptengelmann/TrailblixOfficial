// AI-Personalized Daily Tasks
// Real tasks from Claude AI intelligence analysis, not generic templates

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  CheckCircle, Sparkles, Zap, Clock, Target,
  TrendingUp, Users, BookOpen, FileText, MessageCircle,
  Loader2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface AITask {
  id: string
  title: string
  description: string
  type: 'application' | 'networking' | 'skill_building' | 'resume' | 'interview_prep'
  priority: 'critical' | 'high' | 'medium'
  points: number
  estimated_time: string
  ai_reasoning: string
  resources?: string[]
}

interface DashboardIntelligence {
  daily_tasks: AITask[]
  metadata: {
    analysis_source: 'comprehensive_intelligence' | 'basic_fallback'
    confidence_score: number
  }
}

export default function AIPersonalizedTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<AITask[]>([])
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [completingTask, setCompletingTask] = useState<string | null>(null)
  const [intelligence, setIntelligence] = useState<DashboardIntelligence | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadAITasks()
    }
  }, [user])

  const loadAITasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Get AI-personalized tasks from unified intelligence
      const response = await fetch('/api/dashboard/unified-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load AI tasks')
      }

      const result = await response.json()
      setIntelligence(result.data)
      setTasks(result.data.daily_tasks)

      // Load completed tasks for today
      const today = new Date().toISOString().split('T')[0]
      const { data: completed } = await supabase
        .from('user_activities')
        .select('activity_data')
        .eq('user_id', user?.id)
        .eq('activity_type', 'daily_task_completed')
        .gte('created_at', today)

      const completedIds = new Set(
        completed?.map((a) => a.activity_data?.task_id).filter(Boolean) || []
      )
      setCompletedTaskIds(completedIds)

      logger.info('AI tasks loaded successfully', 'COMPONENT', {
        taskCount: result.data.daily_tasks.length,
        source: result.data.metadata.analysis_source
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to load AI tasks', 'COMPONENT', { error: errorMessage })
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (task: AITask) => {
    if (completedTaskIds.has(task.id) || completingTask) return

    setCompletingTask(task.id)

    try {
      // Optimistic update
      setCompletedTaskIds(prev => new Set([...prev, task.id]))

      const { data: { session } } = await supabase.auth.getSession()

      // Track completion
      await fetch('/api/career-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'complete_daily_task',
          task_data: {
            task_id: task.id,
            task_type: task.type,
            points_earned: task.points,
            streak_eligible: true
          }
        })
      })

      logger.info('Task completed', 'USER_ACTION', { taskId: task.id, points: task.points })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to complete task', 'API', { error: errorMessage })
      // Revert on error
      setCompletedTaskIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(task.id)
        return newSet
      })
    } finally {
      setCompletingTask(null)
    }
  }

  const getTaskIcon = (type: string) => {
    const icons = {
      application: Target,
      networking: Users,
      skill_building: TrendingUp,
      resume: FileText,
      interview_prep: MessageCircle
    }
    return icons[type as keyof typeof icons] || Sparkles
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950/20'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-orange-600 text-white'
      default: return 'bg-blue-600 text-white'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-slate-600 dark:text-slate-400">
            Generating your personalized tasks with AI...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to Load Tasks</h3>
        </div>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={loadAITasks}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    )
  }

  const completedCount = tasks.filter(t => completedTaskIds.has(t.id)).length
  const totalPoints = tasks.reduce((sum, t) => sum + (completedTaskIds.has(t.id) ? t.points : 0), 0)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI-Personalized Tasks
            </h3>
            {intelligence?.metadata.analysis_source === 'comprehensive_intelligence' && (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                AI POWERED
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {completedCount}/{tasks.length} completed today
            {intelligence?.metadata.confidence_score && intelligence.metadata.confidence_score > 0 && (
              <span className="ml-2">
                • {intelligence.metadata.confidence_score}% AI confidence
              </span>
            )}
          </p>
        </div>

        {completedCount > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Zap size={16} />
              <span className="font-bold">{totalPoints} XP</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">earned today</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const Icon = getTaskIcon(task.type)
          const isCompleted = completedTaskIds.has(task.id)
          const isCompleting = completingTask === task.id

          return (
            <div
              key={task.id}
              className={`group p-4 rounded-xl border-2 transition-all duration-200 ${
                isCompleted
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : getPriorityColor(task.priority)
              } hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => completeTask(task)}
                  disabled={isCompleted || isCompleting}
                  className={`mt-0.5 flex-shrink-0 transition-all ${
                    isCompleted
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-500'
                  }`}
                >
                  {isCompleting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle size={20} fill="currentColor" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-current rounded-full group-hover:scale-110 transition-transform"></div>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon size={16} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                      <h4 className={`font-semibold ${
                        isCompleted
                          ? 'text-green-900 dark:text-green-100 line-through'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getPriorityBadge(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Zap size={10} />
                        {task.points}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {task.description}
                  </p>

                  {/* AI Reasoning */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
                    <div className="flex items-start gap-2">
                      <Sparkles size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                        <strong>AI Insight:</strong> {task.ai_reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Clock size={12} />
                      <span>{task.estimated_time}</span>
                    </div>
                    <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                      {task.type.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Resources */}
                  {task.resources && task.resources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={12} className="text-slate-600 dark:text-slate-400" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Recommended Resources:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {task.resources.map((resource, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700"
                          >
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion Celebration */}
      {completedCount === tasks.length && tasks.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
            All tasks completed!
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            You earned {totalPoints} XP today. Outstanding work!
          </p>
          <Link
            href="/intelligence"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Sparkles size={16} />
            View Your Intelligence Dashboard
          </Link>
        </div>
      )}

      {/* Footer */}
      {intelligence?.metadata.analysis_source === 'basic_fallback' && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                <strong>Unlock AI-Personalized Tasks</strong>
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                Complete your career profile to get tasks from Claude AI based on your specific situation, skills, and goals.
              </p>
              <Link
                href="/intelligence"
                className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline"
              >
                Go to Intelligence Dashboard →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
