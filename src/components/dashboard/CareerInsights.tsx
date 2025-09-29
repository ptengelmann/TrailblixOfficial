// Career Insights Widget - AI-powered recommendations and market insights
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { CareerObjectives, JobInteraction, UserActivity } from '@/types/progress'
import { logger } from '@/lib/logger'
import {
  Lightbulb, TrendingUp, Target, AlertCircle,
  DollarSign, ArrowRight, Zap, Award, Clock, CheckCircle
} from 'lucide-react'

interface CareerInsight {
  id: string
  type: 'market_trend' | 'skill_gap' | 'opportunity' | 'improvement' | 'achievement'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action_items?: string[]
  metric?: {
    value: number
    label: string
    trend?: 'up' | 'down' | 'stable'
  }
}

interface MarketData {
  target_role: string
  avg_salary: number
  job_growth: number
  demand_level: 'high' | 'medium' | 'low'
  top_skills: string[]
  trending_companies: string[]
}

export default function CareerInsights() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<CareerInsight[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      generateInsights()
    }
  }, [user])

  const generateInsights = async () => {
    try {
      setLoading(true)

      // Get user data for personalized insights
      const [objectives, activities, jobStats] = await Promise.all([
        supabase
          .from('career_objectives')
          .select('*')
          .eq('user_id', user?.id)
          .single(),
        supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('job_interactions')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ])

      // Generate personalized insights based on user data
      const generatedInsights = await generatePersonalizedInsights(
        objectives.data,
        activities.data || [],
        jobStats.data || []
      )

      setInsights(generatedInsights)

      // Generate market data
      if (objectives.data?.target_role) {
        const market = await generateMarketData(objectives.data.target_role)
        setMarketData(market)
      }

    } catch (error) {
      logger.error('Failed to generate career insights', 'AI', { userId: user?.id, error: error.message, component: 'CareerInsights' })
    } finally {
      setLoading(false)
    }
  }

  const generatePersonalizedInsights = async (
    objectives: CareerObjectives | null,
    activities: UserActivity[],
    jobStats: JobInteraction[]
  ): Promise<CareerInsight[]> => {
    const insights: CareerInsight[] = []

    // Application rate insight
    const applicationsThisMonth = jobStats.filter(j => j.interaction_type === 'applied').length
    const viewedJobsThisMonth = jobStats.filter(j => j.interaction_type === 'viewed').length
    const applyRate = viewedJobsThisMonth > 0 ? (applicationsThisMonth / viewedJobsThisMonth) * 100 : 0

    if (applyRate < 5) {
      insights.push({
        id: 'low_apply_rate',
        type: 'improvement',
        title: 'Low Application Rate',
        description: `You're only applying to ${Math.round(applyRate)}% of jobs you view. Industry average is 15-20%.`,
        priority: 'high',
        action_items: [
          'Set daily application goals (aim for 2-3 quality applications)',
          'Pre-qualify jobs before viewing to focus on realistic matches',
          'Create application templates to speed up the process'
        ],
        metric: {
          value: applyRate,
          label: 'Apply Rate',
          trend: applyRate > 10 ? 'up' : 'down'
        }
      })
    }

    // Activity consistency insight
    const activeDays = new Set(activities.map(a => a.created_at.split('T')[0])).size
    const daysInMonth = 30
    const consistencyRate = (activeDays / daysInMonth) * 100

    if (consistencyRate < 50) {
      insights.push({
        id: 'consistency',
        type: 'improvement',
        title: 'Build Daily Habits',
        description: `You've been active on ${activeDays} out of ${daysInMonth} days. Consistency is key to career success.`,
        priority: 'medium',
        action_items: [
          'Set aside 30 minutes daily for career activities',
          'Use the daily tasks feature to build momentum',
          'Track your progress to stay motivated'
        ],
        metric: {
          value: consistencyRate,
          label: 'Activity Days',
          trend: consistencyRate > 40 ? 'up' : 'down'
        }
      })
    }

    // Networking insight
    const networkingActivities = activities.filter(a => a.activity_type === 'networking_activity').length
    if (networkingActivities < 5) {
      insights.push({
        id: 'networking_gap',
        type: 'opportunity',
        title: 'Expand Your Network',
        description: `Only ${networkingActivities} networking activities this month. 70% of jobs come through networking.`,
        priority: 'high',
        action_items: [
          'Connect with 3-5 professionals weekly on LinkedIn',
          'Attend one industry event or webinar per week',
          'Reach out to alumni in your target field'
        ]
      })
    }

    // Achievement insight
    if (activities.length > 20) {
      insights.push({
        id: 'high_activity',
        type: 'achievement',
        title: 'Great Momentum! 🚀',
        description: `You've completed ${activities.length} career activities this month - that's excellent consistency!`,
        priority: 'low',
        action_items: [
          'Keep up this excellent pace',
          'Consider mentoring others in your job search',
          'Document your job search strategy for future reference'
        ]
      })
    }

    // Market opportunity insight
    if (objectives?.target_role) {
      insights.push({
        id: 'market_opportunity',
        type: 'opportunity',
        title: 'Market Insights for Your Role',
        description: `${objectives.target_role} positions are seeing increased demand. Average time to hire has decreased by 15%.`,
        priority: 'medium',
        action_items: [
          'Take advantage of the favorable market conditions',
          'Focus on companies actively hiring for your skills',
          'Consider reaching out to recruiters in this space'
        ]
      })
    }

    return insights
  }

  const generateMarketData = async (targetRole: string): Promise<MarketData> => {
    // This would typically call an external market data API
    // For now, return mock data based on the role
    return {
      target_role: targetRole,
      avg_salary: 85000,
      job_growth: 12,
      demand_level: 'high',
      top_skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
      trending_companies: ['Microsoft', 'Amazon', 'Google', 'Meta', 'Apple']
    }
  }

  const getInsightIcon = (type: string) => {
    const icons = {
      market_trend: TrendingUp,
      skill_gap: Target,
      opportunity: Zap,
      improvement: AlertCircle,
      achievement: Award
    }
    return icons[type as keyof typeof icons] || Lightbulb
  }

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'achievement') return 'text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-950/50 border-green-200 dark:border-green-800'
    if (priority === 'high') return 'text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-800'
    if (priority === 'medium') return 'text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
    return 'text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400'
    }
    return `px-2 py-1 text-xs font-medium rounded ${colors[priority as keyof typeof colors]}`
  }

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Career Insights
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Personalized recommendations and market data
          </p>
        </div>
        <Lightbulb className="text-amber-500" size={24} />
      </div>

      {/* Market Overview */}
      {marketData && (
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
            Market Overview: {marketData.target_role}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <DollarSign size={14} />
                Average Salary
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                ${marketData.avg_salary.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <TrendingUp size={14} />
                Job Growth
              </div>
              <div className="font-semibold text-green-600 dark:text-green-500">
                +{marketData.job_growth}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = getInsightIcon(insight.type)
          const isExpanded = expandedInsight === insight.id

          return (
            <div
              key={insight.id}
              className={`rounded-lg border transition-all ${getInsightColor(insight.type, insight.priority)}`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon size={20} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold">{insight.title}</h5>
                      <span className={getPriorityBadge(insight.priority)}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                      {insight.description}
                    </p>

                    {insight.metric && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{Math.round(insight.metric.value)}</span>
                          <span className="opacity-75">{insight.metric.label}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <ArrowRight
                    size={16}
                    className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {/* Expanded Action Items */}
              {isExpanded && insight.action_items && (
                <div className="px-4 pb-4 border-t border-current/20">
                  <h6 className="font-medium mb-2 mt-3">Action Items:</h6>
                  <ul className="space-y-1">
                    {insight.action_items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>Updated daily based on your activity</span>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Last updated: Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}