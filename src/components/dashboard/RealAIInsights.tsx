// Real AI Insights Component
// Uses actual Claude AI analysis + Adzuna data, not hardcoded fake data

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  Lightbulb, TrendingUp, AlertTriangle, Award, Zap,
  DollarSign, Target, ArrowRight, ExternalLink, Loader2
} from 'lucide-react'
import Link from 'next/link'

interface AIInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'recommendation'
  title: string
  message: string
  action: string
  priority: 'high' | 'medium' | 'low'
  data_source: string
}

export default function RealAIInsights() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadAIInsights()
    }
  }, [user])

  const loadAIInsights = async () => {
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
        setInsights(result.data.ai_insights)

        logger.info('AI insights loaded', 'COMPONENT', {
          count: result.data.ai_insights.length
        })
      }

    } catch (error: any) {
      logger.error('Failed to load AI insights', 'COMPONENT', { error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Zap
      case 'warning': return AlertTriangle
      case 'achievement': return Award
      default: return Lightbulb
    }
  }

  const getInsightStyle = (type: string, priority: string) => {
    if (type === 'achievement') {
      return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
    }
    if (type === 'warning') {
      return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
    }
    if (type === 'opportunity' && priority === 'high') {
      return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    }
    return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
  }

  const getDataSourceLabel = (source: string) => {
    switch (source) {
      case 'claude_ai_comprehensive_analysis':
        return 'Claude AI Analysis'
      case 'adzuna_api_real_market_data':
        return 'Adzuna Market Data'
      case 'claude_ai_skill_analysis':
        return 'Claude AI Skills'
      case 'database_user_activity':
        return 'Your Activity Data'
      default:
        return 'AI Analysis'
    }
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

  if (insights.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <Lightbulb className="text-blue-600" size={24} />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Get AI-Powered Insights
          </h3>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
          Complete your career profile to receive personalized insights from Claude AI based on real market data.
        </p>
        <Link
          href="/intelligence"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <TrendingUp size={16} />
          Go to Intelligence Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="text-amber-500" size={20} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI Career Insights
            </h3>
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded">
              REAL AI
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Powered by Claude AI & real market data
          </p>
        </div>
        <Link
          href="/intelligence"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          View Full Analysis
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type)
          const isExpanded = expandedInsight === `${insight.type}_${index}`

          return (
            <div
              key={`${insight.type}_${index}`}
              className={`rounded-xl border-2 transition-all duration-200 ${getInsightStyle(insight.type, insight.priority)} hover:shadow-md`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedInsight(isExpanded ? null : `${insight.type}_${index}`)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.type === 'achievement' ? 'bg-green-100 dark:bg-green-900/30' :
                    insight.type === 'warning' ? 'bg-red-100 dark:bg-red-900/30' :
                    insight.type === 'opportunity' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <Icon size={20} className={
                      insight.type === 'achievement' ? 'text-green-600' :
                      insight.type === 'warning' ? 'text-red-600' :
                      insight.type === 'opportunity' ? 'text-blue-600' :
                      'text-amber-600'
                    } />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">
                        {insight.title}
                      </h4>
                      <ArrowRight
                        size={16}
                        className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>

                    <p className="text-sm opacity-90 mb-2">
                      {insight.message}
                    </p>

                    <div className="flex items-center gap-2 text-xs opacity-75">
                      <Target size={12} />
                      <span>{getDataSourceLabel(insight.data_source)}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-current/20">
                    <button className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-current/30 hover:border-current/50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <span>{insight.action}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer - Data Attribution */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live AI analysis updated daily</span>
          </div>
          <Link
            href="/intelligence"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            View detailed intelligence →
          </Link>
        </div>
      </div>
    </div>
  )
}
