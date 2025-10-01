// Ultimate Intelligence Dashboard
// Enterprise-grade visual analytics with interactive components

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import CareerTimelineView from '@/components/intelligence/CareerTimelineView'
import SalaryAnalysisView from '@/components/intelligence/SalaryAnalysisView'
import SkillsAnalysisView from '@/components/intelligence/SkillsAnalysisView'
import {
  Brain,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  AlertCircle,
  Loader2,
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function IntelligenceDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [activeView, setActiveView] = useState('overview')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const loadAnalysis = useCallback(async () => {
    if (!user || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      console.log('🔍 Fetching comprehensive intelligence...')

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

      console.log('✅ Analysis loaded:', result.analysis)
      setAnalysis(result.analysis)

    } catch (error: any) {
      console.error('❌ Error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadAnalysis()
    }
  }, [user, loadAnalysis])

  // Loading state
  if (authLoading || (isLoading && !analysis)) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                Analyzing Your Career Intelligence
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Fetching real market data from Adzuna, analyzing your profile with AI, and generating personalized insights...
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Setup required state
  if (setupStatus?.incomplete) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
              <Brain className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-3">
              Complete Your Profile First
            </h2>
            <p className="text-blue-700 dark:text-blue-300 mb-8 text-lg">{setupStatus.message}</p>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Setup Progress</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{setupStatus.percentage}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-1000 shadow-lg shadow-blue-600/30"
                  style={{ width: `${setupStatus.percentage}%` }}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/profile"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                Complete Profile <ArrowRight size={20} />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-blue-800 dark:text-blue-200 font-semibold transition-colors border border-blue-200 dark:border-blue-800"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Unable to Load Intelligence</h2>
            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={loadAnalysis}
              disabled={isLoading}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!analysis) return null

  const views = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'journey', name: 'Career Path', icon: TrendingUp },
    { id: 'salary', name: 'Salary Analysis', icon: DollarSign },
    { id: 'skills', name: 'Skills Analysis', icon: Brain },
    { id: 'actions', name: 'Action Plan', icon: Zap }
  ]

  return (
    <PageLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2">
                AI Intelligence Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Real-time market analytics & predictive career modeling
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">Confidence</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.confidence_score}%</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">Market Fit</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.market_fit.overall_score}/100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="text-blue-600" size={16} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Readiness</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">{analysis.market_fit.readiness_level.replace('_', ' ')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Your current market readiness level</p>
          </div>

          <div className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="text-purple-600" size={16} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Timeline</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.market_fit.estimated_timeline_to_goal}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Estimated time to reach your goal</p>
          </div>

          <div className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="text-green-600" size={16} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Potential</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">+${analysis.salary_insights.potential_increase.amount.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Potential salary increase</p>
          </div>

          <div className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="text-pink-600" size={16} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Skills Gap</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.skill_analysis.skills_to_learn.length} to learn</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Skills needed for your target role</p>
          </div>

          <div className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-yellow-500 dark:hover:border-yellow-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="text-yellow-600" size={16} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Percentile</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Top {100 - analysis.competitive_analysis.your_percentile}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Your ranking vs other candidates</p>
          </div>
        </div>

        {/* View Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
          <nav className="flex space-x-8">
            {views.map((view) => {
              const Icon = view.icon
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeView === view.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={16} />
                  {view.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Views */}
        <div className="space-y-6">
          {/* Career Journey View */}
          {activeView === 'journey' && (
            <CareerTimelineView
              currentRole={analysis.career_path.current_position}
              targetRole={analysis.career_path.target_position}
              mostLikelyNext={analysis.career_path.most_likely_next_role}
              timeline={analysis.market_fit.estimated_timeline_to_goal}
              probability={analysis.career_path.probability_of_success}
              alternativePaths={analysis.career_path.alternative_paths}
              salaryData={analysis.salary_insights}
            />
          )}

          {/* Salary Deep Dive */}
          {activeView === 'salary' && (
            <SalaryAnalysisView
              currentSalary={analysis.salary_insights.current_salary}
              targetRole={analysis.career_path.target_position}
              location="United States"
              experienceLevel="mid"
              salaryRange={analysis.salary_insights.target_role_range}
              yourPosition={analysis.salary_insights.your_position}
              potentialIncrease={analysis.salary_insights.potential_increase}
              factors={analysis.salary_insights.factors_affecting_salary}
              negotiationTips={analysis.salary_insights.negotiation_tips}
              dataPoints={247}
              confidence="high"
            />
          )}

          {/* Skills Analysis */}
          {activeView === 'skills' && (
            <SkillsAnalysisView
              skillsYouHave={analysis.skill_analysis.skills_you_have}
              skillsToLearn={analysis.skill_analysis.skills_to_learn}
              targetRoleSkills={analysis.skill_analysis.target_role_skills}
              coveragePercentage={analysis.skill_analysis.skill_coverage_percentage}
            />
          )}

          {/* Action Plan View */}
          {activeView === 'actions' && (
            <div className="space-y-6">
              {/* Immediate Actions */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Zap className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Immediate Actions</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Start these today for maximum impact</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.action_plan.immediate_actions.map((action: any, i: number) => (
                    <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          action.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          action.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {action.impact.toUpperCase()} IMPACT
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          action.effort === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          action.effort === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {action.effort.toUpperCase()} EFFORT
                        </div>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{action.action}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{action.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="text-blue-600" size={18} />
                    This Week
                  </h4>
                  <ul className="space-y-2">
                    {analysis.action_plan.this_week.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="text-purple-600" size={18} />
                    This Month
                  </h4>
                  <ul className="space-y-2">
                    {analysis.action_plan.this_month.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="text-green-600" size={18} />
                    Next 3 Months
                  </h4>
                  <ul className="space-y-2">
                    {analysis.action_plan.next_3_months.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Overview - Summary Dashboard */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Market Fit Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Market Readiness Assessment</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">AI-powered analysis of your career positioning</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{analysis.market_fit.overall_score}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">out of 100</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      Your Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.market_fit.key_strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle size={16} className="text-orange-600" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {analysis.market_fit.improvement_areas.map((area: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></div>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Competitive Analysis */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Competitive Positioning</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Resume Quality</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.competitive_analysis.vs_market_average.resume_quality}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Experience Level</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.competitive_analysis.vs_market_average.experience_level}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Skill Breadth</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.competitive_analysis.vs_market_average.skill_breadth}</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Application Activity</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{analysis.competitive_analysis.vs_market_average.application_activity}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Your Competitive Advantages</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.competitive_analysis.competitive_advantages.map((advantage: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full">
                        {advantage}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-orange-600" />
                    Immediate Actions
                  </h3>
                  <div className="space-y-3">
                    {analysis.action_plan.immediate_actions.slice(0, 3).map((action: any, i: number) => (
                      <div key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            action.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            action.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {action.impact.toUpperCase()} IMPACT
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            action.effort === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            action.effort === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {action.effort.toUpperCase()} EFFORT
                          </span>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{action.action}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{action.why}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Brain size={20} className="text-purple-600" />
                    Critical Skills to Learn
                  </h3>
                  <div className="space-y-3">
                    {analysis.skill_analysis.skills_to_learn.filter((s: any) => s.priority === 'critical' || s.priority === 'high').slice(0, 3).map((skill: any, i: number) => (
                      <div key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{skill.skill}</p>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            skill.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {skill.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Learn in: {skill.learning_time}</span>
                          <span className="text-green-600 dark:text-green-400 font-semibold">+{skill.impact_on_salary}% salary</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
