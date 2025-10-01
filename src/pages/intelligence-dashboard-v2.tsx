// Enhanced Intelligence Dashboard V2
// Uses new comprehensive analysis API with real data

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import {
  Brain,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Loader2,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function IntelligenceDashboardV2() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadAnalysis()
    }
  }, [user])

  const loadAnalysis = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      console.log('🔍 Calling comprehensive analysis API...')

      const response = await fetch('/api/intelligence/comprehensive-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'incomplete_profile') {
          setSetupStatus({
            incomplete: true,
            percentage: result.completion_percentage,
            message: result.message
          })
          setIsLoading(false)
          return
        }
        throw new Error(result.error || 'Failed to load analysis')
      }

      console.log('✅ Analysis loaded successfully:', result.analysis)
      setAnalysis(result.analysis)

    } catch (error: any) {
      console.error('❌ Failed to load analysis:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                Analyzing Your Career Intelligence
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This may take 15-30 seconds. Fetching real market data and running AI analysis...
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Show setup required message
  if (setupStatus?.incomplete) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-blue-600 dark:text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Complete Your Profile First</h2>
            <p className="text-blue-700 dark:text-blue-300 mb-6">{setupStatus.message}</p>

            <div className="mb-6">
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${setupStatus.percentage}%` }}
                />
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">{setupStatus.percentage}% Complete</p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href="/profile"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Complete Profile →
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg text-blue-800 dark:text-blue-200 font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">Unable to Load Intelligence</h2>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={loadAnalysis}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!analysis) return null

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'skills', name: 'Skills Gap', icon: Brain },
    { id: 'salary', name: 'Salary', icon: DollarSign },
    { id: 'career', name: 'Career Path', icon: TrendingUp },
    { id: 'actions', name: 'Action Plan', icon: Zap }
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Intelligence Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">Real-time market analysis & career predictions</p>
              </div>
            </div>

            <button
              onClick={loadAnalysis}
              disabled={isLoading}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={18} className={`text-blue-600 dark:text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Market Fit Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Market Fit Score</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.market_fit.overall_score / 100)}`}
                    className="text-blue-600 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {analysis.market_fit.overall_score}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      analysis.market_fit.readiness_level === 'ready' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      analysis.market_fit.readiness_level === 'almost_ready' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      analysis.market_fit.readiness_level === 'needs_prep' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {analysis.market_fit.readiness_level.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Estimated timeline: <span className="font-semibold text-slate-900 dark:text-white">{analysis.market_fit.estimated_timeline_to_goal}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-green-600" size={20} />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {analysis.market_fit.key_strengths.slice(0, 3).map((strength: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-orange-600" size={20} />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Areas to Improve</h3>
            </div>
            <ul className="space-y-2">
              {analysis.market_fit.improvement_areas.slice(0, 3).map((area: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="px-2 py-2">
            <nav className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                      activeSection === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Salary Section */}
        {activeSection === 'salary' && analysis.salary_insights && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="text-green-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Salary Intelligence</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Market Minimum</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${analysis.salary_insights.target_role_range.min.toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-500">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Market Median</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    ${analysis.salary_insights.target_role_range.median.toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Market Maximum</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${analysis.salary_insights.target_role_range.max.toLocaleString()}
                  </p>
                </div>
              </div>

              {analysis.salary_insights.current_salary && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Your Current Position</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{analysis.salary_insights.your_position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Potential Increase</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        +${analysis.salary_insights.potential_increase.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        (+{analysis.salary_insights.potential_increase.percentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Negotiation Tips:</h4>
                {analysis.salary_insights.negotiation_tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Sparkles size={16} className="text-yellow-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other sections will be added similarly */}
        {activeSection === 'overview' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">
              Full overview coming soon. Switch to other tabs to see Skills, Salary, Career Path, and Action Plan.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
