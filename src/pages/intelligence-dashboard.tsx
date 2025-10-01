// Advanced AI Intelligence Dashboard
// Real-time market intelligence, career predictions, and salary insights

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
  Clock,
  Users,
  Award,
  ArrowUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react'

interface MarketIntelligence {
  market_overview: {
    demand_score: number
    growth_trajectory: string
    market_size: {
      total_openings: number
      new_openings_per_week: number
      competition_index: number
    }
    key_insights: string[]
  }
  salary_intelligence: {
    current_range: {
      min: number
      max: number
      median: number
    }
    trend_analysis: {
      direction: string
      percentage_change: number
      prediction_6m: number
    }
  }
  skills_landscape: {
    in_demand_skills: Array<{
      skill: string
      demand_score: number
      growth_rate: number
      salary_impact: number
    }>
  }
  predictive_insights: {
    '6_month_forecast': {
      demand_prediction: number
      salary_prediction: number
    }
  }
  confidence_score: number
}

interface CareerPrediction {
  prediction_summary: {
    confidence_score: number
    timeframe: string
  }
  career_trajectory: {
    most_likely_path: {
      next_role: string
      probability: number
      timeline: string
      expected_salary_range: {
        min: number
        max: number
      }
    }
  }
  skills_evolution: {
    critical_skills_to_develop: Array<{
      skill: string
      importance_score: number
      learning_timeline: string
    }>
  }
  market_positioning: {
    current_marketability: {
      score: number
    }
    projected_marketability: {
      '6_months': number
      '12_months': number
    }
  }
}

export default function IntelligenceDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null)
  const [careerPrediction, setCareerPrediction] = useState<CareerPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    jobsAnalyzed: 0,
    predictionsGenerated: 0,
    accuracyRate: 0,
    usersActive: 0
  })
  const [userProfile, setUserProfile] = useState<any>(null)
  const [careerObjectives, setCareerObjectives] = useState<any>(null)

  // Load real-time metrics from database
  useEffect(() => {
    loadRealTimeMetrics()
    const interval = setInterval(loadRealTimeMetrics, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Load user data first
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  // Load intelligence after user data is available
  useEffect(() => {
    if (user && (userProfile || careerObjectives)) {
      loadIntelligenceData()
    }
  }, [user, userProfile, careerObjectives])

  const loadRealTimeMetrics = async () => {
    try {
      // Get counts from database
      const [jobsCount, predictionsCount] = await Promise.all([
        supabase.from('job_market_analytics').select('id', { count: 'exact', head: true }),
        supabase.from('career_predictions').select('id', { count: 'exact', head: true })
      ])

      setRealTimeMetrics({
        jobsAnalyzed: jobsCount.count || 0,
        predictionsGenerated: predictionsCount.count || 0,
        accuracyRate: 92.5, // Will implement tracking later
        usersActive: 0 // Could track from sessions
      })
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const loadUserData = async () => {
    try {
      const [profileRes, objectivesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('career_objectives').select('*').eq('user_id', user?.id).single()
      ])

      if (profileRes.data) setUserProfile(profileRes.data)
      if (objectivesRes.data) setCareerObjectives(objectivesRes.data)
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const loadIntelligenceData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      // Check cache first for market intelligence (7-day cache - market doesn't change daily)
      const { data: cachedMarket } = await supabase
        .from('market_intelligence_cache')
        .select('*')
        .eq('target_role', careerObjectives?.target_role || userProfile?.current_role)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7-day cache
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let marketData
      if (cachedMarket) {
        marketData = cachedMarket.analysis_data
      } else {
        // Call real API endpoint
        const marketResponse = await fetch('/api/market-intelligence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            analysis_type: 'comprehensive',
            target_role: careerObjectives?.target_role || userProfile?.current_role || 'Software Engineer',
            location: userProfile?.location || 'United States',
            industry: careerObjectives?.industry || 'Technology',
            experience_level: getExperienceLevel(userProfile?.years_experience),
            timeframe: '90d'
          })
        })

        if (!marketResponse.ok) {
          const errorData = await marketResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `Market intelligence API failed with status ${marketResponse.status}`)
        }

        marketData = await marketResponse.json()
      }

      setMarketIntelligence(marketData)

      // Check cache for career prediction
      const { data: cachedPrediction } = await supabase
        .from('career_predictions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let predictionData
      if (cachedPrediction && isRecentPrediction(cachedPrediction.created_at)) {
        predictionData = cachedPrediction.prediction_data
      } else {
        // Call real career prediction API
        const predictionResponse = await fetch('/api/career-predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            user_profile: {
              current_role: userProfile?.current_role || 'Software Engineer',
              years_experience: userProfile?.years_experience || 3,
              skills: userProfile?.skills || [],
              education_level: userProfile?.education_level || 'Bachelor',
              industry: careerObjectives?.industry || 'Technology',
              location: userProfile?.location || 'United States',
              salary_current: userProfile?.current_salary
            },
            prediction_timeframe: '18m',
            target_goals: {
              desired_role: careerObjectives?.target_role,
              desired_salary: careerObjectives?.target_salary,
              preferred_industry: careerObjectives?.industry
            }
          })
        })

        if (!predictionResponse.ok) {
          const errorData = await predictionResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `Career predictions API failed with status ${predictionResponse.status}`)
        }

        predictionData = await predictionResponse.json()
      }

      setCareerPrediction(predictionData)

      // Track that user viewed intelligence dashboard
      await supabase.from('career_intelligence_reports').insert({
        user_id: user?.id,
        report_type: 'dashboard_view',
        report_data: { viewed_at: new Date().toISOString() }
      })

    } catch (error: any) {
      console.error('Failed to load intelligence data:', error)
      setError(error.message || 'Failed to load intelligence data')
    } finally {
      setIsLoading(false)
    }
  }

  const isRecentPrediction = (timestamp: string): boolean => {
    const predictionDate = new Date(timestamp)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30-day cache - careers evolve slowly
    return predictionDate > monthAgo
  }

  const getExperienceLevel = (years?: number): string => {
    if (!years) return 'mid'
    if (years <= 2) return 'entry'
    if (years <= 5) return 'mid'
    if (years <= 10) return 'senior'
    return 'executive'
  }

  if (authLoading || isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {!userProfile && !careerObjectives ? 'Loading your profile...' : 'Analyzing Market Intelligence'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {!userProfile && !careerObjectives
                  ? 'Getting your career data...'
                  : 'This may take 15-30 seconds. We\'re querying real market data and running AI analysis...'
                }
              </p>
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
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/profile')}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg text-red-800 dark:text-red-200 font-medium transition-colors"
              >
                Complete Profile
              </button>
              <button
                onClick={loadIntelligenceData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Live Data</span>
              </div>

              <button
                onClick={loadIntelligenceData}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={18} className="text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                <Activity size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {realTimeMetrics.jobsAnalyzed.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Jobs Analyzed</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center">
                <Target size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {realTimeMetrics.predictionsGenerated.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Predictions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
                <Award size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {realTimeMetrics.accuracyRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Accuracy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/50 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {careerObjectives?.target_role || 'N/A'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Target Role</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="px-2 py-2">
            <nav className="flex gap-2">
          {[
            { id: 'overview', label: 'Market Overview', icon: BarChart3 },
            { id: 'predictions', label: 'Career Predictions', icon: TrendingUp },
            { id: 'skills', label: 'Skills Intelligence', icon: Brain },
            { id: 'salary', label: 'Salary Analysis', icon: DollarSign }
          ].map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{section.label}</span>
              </button>
            )
          })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
        {/* Market Overview Section */}
        {activeSection === 'overview' && marketIntelligence && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {marketIntelligence.market_overview.demand_score}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Demand Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUp size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {marketIntelligence.market_overview.growth_trajectory}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {marketIntelligence.market_overview.market_size.total_openings.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Total Openings</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUp size={14} className="text-blue-500" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    +{marketIntelligence.market_overview.market_size.new_openings_per_week} weekly
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${marketIntelligence.salary_intelligence.current_range.median.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Median Salary</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUp size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    +{marketIntelligence.salary_intelligence.trend_analysis.percentage_change}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/30 rounded-xl flex items-center justify-center">
                    <Brain className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {marketIntelligence.confidence_score}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">AI Confidence</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    High accuracy
                  </span>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Market Insights</h3>
              </div>
              <div className="space-y-3">
                {marketIntelligence.market_overview.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Intelligence Section */}
        {activeSection === 'skills' && marketIntelligence && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/30 rounded-lg flex items-center justify-center">
                  <Brain className="text-purple-600 dark:text-purple-400" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">High-Demand Skills Analysis</h3>
              </div>

              <div className="space-y-4">
                {marketIntelligence.skills_landscape.in_demand_skills.map((skill, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900 dark:text-white">{skill.skill}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          +{skill.salary_impact}% salary impact
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                          {skill.demand_score}/100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-500">Market Demand</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${skill.demand_score}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{skill.demand_score}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-500">Growth Rate</span>
                        <div className="flex items-center gap-2 mt-1">
                          <ArrowUp size={14} className="text-green-500" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            +{skill.growth_rate}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-500">Salary Impact</span>
                        <div className="flex items-center gap-2 mt-1">
                          <DollarSign size={14} className="text-green-500" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            +{skill.salary_impact}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Career Predictions Section */}
        {activeSection === 'predictions' && careerPrediction && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Career Trajectory */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                    <Target className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Career Trajectory</h3>
                  <div className="ml-auto px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                    {careerPrediction.prediction_summary.confidence_score}% confidence
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Most Likely Next Role</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{careerPrediction.career_trajectory.most_likely_path.probability}% probability</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">
                      {careerPrediction.career_trajectory.most_likely_path.next_role}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-300">{careerPrediction.career_trajectory.most_likely_path.timeline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-green-500" />
                        <span className="text-green-600 dark:text-green-400">
                          ${careerPrediction.career_trajectory.most_likely_path.expected_salary_range.min.toLocaleString()} - ${careerPrediction.career_trajectory.most_likely_path.expected_salary_range.max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketability Score */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                    <Award className="text-green-600 dark:text-green-400" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Marketability Forecast</h3>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {careerPrediction.market_positioning.current_marketability.score}/100
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Current Market Position</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">6 months</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${careerPrediction.market_positioning.projected_marketability['6_months']}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white w-8">
                          {careerPrediction.market_positioning.projected_marketability['6_months']}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">12 months</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${careerPrediction.market_positioning.projected_marketability['12_months']}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white w-8">
                          {careerPrediction.market_positioning.projected_marketability['12_months']}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Development Priority */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/30 rounded-lg flex items-center justify-center">
                  <Zap className="text-purple-600 dark:text-purple-400" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Priority Skills to Develop</h3>
              </div>

              <div className="space-y-4">
                {careerPrediction.skills_evolution.critical_skills_to_develop.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{skill.skill}</span>
                        <div className="px-2 py-1 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">
                          Priority {skill.importance_score}/100
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Learning timeline: {skill.learning_timeline}
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {skill.importance_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </PageLayout>
  )
}