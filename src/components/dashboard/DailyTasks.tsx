// Daily Career Tasks - Drive daily engagement and habit formation
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import {
  CheckCircle, Target, Users, TrendingUp, Star, Flame,
  Search, MessageCircle, Send
} from 'lucide-react'

interface DailyTask {
  id: string
  type: 'job_search' | 'networking' | 'skill_building' | 'application' | 'follow_up'
  title: string
  description: string
  points: number
  completed: boolean
  streak_eligible: boolean
  category: string
}

interface UserStreaks {
  current_streak: number
  longest_streak: number
  total_points: number
  level: number
  tasks_completed_today: number
  weekly_goal: number
  weekly_progress: number
}

export default function DailyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [streaks, setStreaks] = useState<UserStreaks | null>(null)
  const [loading, setLoading] = useState(true)
  const [completingTask, setCompletingTask] = useState<string | null>(null)

  // Generate personalized daily tasks based on user goals and progress
  const generateDailyTasks = async (): Promise<DailyTask[]> => {
    const { data: objectives } = await supabase
      .from('career_objectives')
      .select('*')
      .eq('user_id', user?.id)
      .single()

    await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const baseTasks: Omit<DailyTask, 'id' | 'completed'>[] = [
      // Job Search Tasks
      {
        type: 'job_search',
        title: 'Browse New Job Opportunities',
        description: `Search for ${objectives?.target_role || 'relevant'} positions in ${objectives?.target_industry || 'your field'}`,
        points: 15,
        streak_eligible: true,
        category: 'Career Search'
      },
      {
        type: 'application',
        title: 'Apply to Quality Positions',
        description: 'Apply to at least 1 job that matches your criteria',
        points: 25,
        streak_eligible: true,
        category: 'Career Search'
      },

      // Networking Tasks
      {
        type: 'networking',
        title: 'Connect with 2 Industry Professionals',
        description: 'Send personalized LinkedIn connection requests to people in your target industry',
        points: 20,
        streak_eligible: true,
        category: 'Network Building'
      },
      {
        type: 'networking',
        title: 'Engage with Professional Content',
        description: 'Like, comment, or share 3 industry-related posts on LinkedIn',
        points: 10,
        streak_eligible: false,
        category: 'Network Building'
      },
      {
        type: 'follow_up',
        title: 'Follow Up on Applications',
        description: 'Check status or follow up on applications from this week',
        points: 15,
        streak_eligible: false,
        category: 'Application Management'
      },

      // Skill Building Tasks (personalized)
      {
        type: 'skill_building',
        title: 'Learn Something New',
        description: 'Spend 20 minutes learning a skill relevant to your target role',
        points: 20,
        streak_eligible: true,
        category: 'Professional Development'
      }
    ]

    // Add day-specific tasks
    const dayOfWeek = new Date().getDay()
    if (dayOfWeek === 1) { // Monday
      baseTasks.push({
        type: 'application',
        title: 'Weekly Career Planning',
        description: 'Review your goals and plan your career activities for the week',
        points: 30,
        streak_eligible: false,
        category: 'Planning'
      })
    }

    if (dayOfWeek === 5) { // Friday
      baseTasks.push({
        type: 'networking',
        title: 'Weekly Networking Recap',
        description: 'Reach out to 1 person you met this week for a coffee chat',
        points: 25,
        streak_eligible: false,
        category: 'Network Building'
      })
    }

    // Convert to full tasks with IDs
    return baseTasks.map((task, index) => ({
      ...task,
      id: `daily_${new Date().toISOString().split('T')[0]}_${index}`,
      completed: false
    }))
  }

  const loadDailyProgress = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        logger.info('No active session for daily progress', 'COMPONENT', { component: 'DailyTasks' })
        return
      }

      const response = await fetch('/api/career-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'get_daily_progress'
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStreaks(result.streaks)
        }
      } else {
        logger.info('Daily progress not available yet', 'COMPONENT', { component: 'DailyTasks' })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to load daily progress', 'COMPONENT', { component: 'DailyTasks', error: errorMessage })
      // Don't show error to user for daily progress - just log it
    }
  }

  useEffect(() => {
    if (user) {
      const initDailyTasks = async () => {
        try {
          setLoading(true)
          const generatedTasks = await generateDailyTasks()

          // Check which tasks are already completed today
          const { data: completedToday } = await supabase
            .from('user_activities')
            .select('activity_data')
            .eq('user_id', user.id)
            .eq('activity_type', 'daily_task_completed')
            .gte('created_at', new Date().toISOString().split('T')[0])

          const completedTaskIds = completedToday?.map(
            (activity: { activity_data?: { task_id?: string } }) => activity.activity_data?.task_id
          ) || []

          const tasksWithCompletionStatus = generatedTasks.map(task => ({
            ...task,
            completed: completedTaskIds.includes(task.id)
          }))

          setTasks(tasksWithCompletionStatus)
          await loadDailyProgress()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          logger.error('Failed to initialize daily tasks', 'API', { component: 'DailyTasks', error: errorMessage })
        } finally {
          setLoading(false)
        }
      }

      initDailyTasks()
    }
  }, [user])

  const completeTask = async (task: DailyTask) => {
    if (task.completed || completingTask) return

    setCompletingTask(task.id)

    try {
      // Update local state optimistically
      setTasks(prev => prev.map(t =>
        t.id === task.id ? { ...t, completed: true } : t
      ))

      // Track the completion
      const { data: { session } } = await supabase.auth.getSession()

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
            streak_eligible: task.streak_eligible
          }
        })
      })

      // Reload progress to get updated streaks and points
      await loadDailyProgress()

      // Show celebration for significant achievements
      if (task.streak_eligible && streaks) {
        const newStreak = streaks.current_streak + 1
        if (newStreak > 0 && newStreak % 7 === 0) {
          // Show week streak celebration
          logger.info(`User achieved ${newStreak} day streak`, 'USER_ACTION', { component: 'DailyTasks', streak: newStreak, userId: user?.id })
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to complete daily task', 'API', { component: 'DailyTasks', taskId: task.id, error: errorMessage })
      // Revert optimistic update on error
      setTasks(prev => prev.map(t =>
        t.id === task.id ? { ...t, completed: false } : t
      ))
    } finally {
      setCompletingTask(null)
    }
  }

  const getTaskIcon = (type: string) => {
    const icons = {
      job_search: Search,
      networking: Users,
      skill_building: TrendingUp,
      application: Send,
      follow_up: MessageCircle
    }
    return icons[type as keyof typeof icons] || Target
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆'
    if (streak >= 21) return '🔥'
    if (streak >= 14) return '⚡'
    if (streak >= 7) return '✨'
    return '💪'
  }

  const getLevelInfo = (points: number) => {
    const level = Math.floor(points / 100) + 1
    const nextLevelPoints = level * 100
    const progress = ((points % 100) / 100) * 100

    return { level, nextLevelPoints, progress }
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

  const completedTasksToday = tasks.filter(t => t.completed).length
  const totalPoints = streaks?.total_points || 0
  const { level, progress } = getLevelInfo(totalPoints)

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Today&apos;s Career Tasks
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {completedTasksToday}/{tasks.length} completed
          </p>
        </div>

        {streaks && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-500 mb-1">
              <Flame size={16} />
              <span className="font-medium">{streaks.current_streak} day streak</span>
              <span className="text-lg">{getStreakEmoji(streaks.current_streak)}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Level {level} • {totalPoints} points
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
          <span>Daily Progress</span>
          <span>{completedTasksToday}/{tasks.length}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedTasksToday / tasks.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const Icon = getTaskIcon(task.type)
          return (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all ${
                task.completed
                  ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => completeTask(task)}
                  disabled={task.completed || completingTask === task.id}
                  className={`mt-0.5 transition-colors ${
                    task.completed
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-500'
                  }`}
                >
                  {completingTask === task.id ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  ) : task.completed ? (
                    <CheckCircle size={20} fill="currentColor" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-current rounded-full"></div>
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className="text-slate-600 dark:text-slate-400" />
                    <h4 className={`font-medium ${
                      task.completed
                        ? 'text-green-900 dark:text-green-100 line-through'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs rounded">
                      <Star size={12} />
                      {task.points}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                      {task.category}
                    </span>
                    {task.streak_eligible && (
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-500">
                        <Flame size={12} />
                        Streak
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion Celebration */}
      {completedTasksToday === tasks.length && tasks.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <div className="text-2xl mb-2">🎉</div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
            All tasks completed!
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Great job! You earned {tasks.reduce((sum, t) => sum + (t.completed ? t.points : 0), 0)} points today.
          </p>
        </div>
      )}
    </div>
  )
}