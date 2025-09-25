// src/pages/career-coach.tsx - AI Career Coach Page (Redesigned)
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import { 
  Sparkles, Calendar, Target, TrendingUp, Lightbulb, 
  CheckCircle, AlertTriangle, Clock, RefreshCw, 
  BookOpen, ArrowRight, Star, Zap, Users, BarChart3
} from 'lucide-react'

interface EnhancedRecommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeline: string
  difficulty: 'easy' | 'moderate' | 'challenging'
  impact: 'high' | 'medium' | 'low'
  specific_actions: string[]
  success_metrics: string
  resources: string[]
}

interface RecommendationResponse {
  recommendations: EnhancedRecommendation[]
  priority_focus: string
  timeline_roadmap: {
    '30_days': string
    '90_days': string
    '6_months': string
  }
  market_insights: string
  red_flags: string[]
  confidence_factors: string[]
  next_steps: string
  generated_at: string
  confidence_score: number
  next_review_date: string
  personalization_factors?: string[]
}

export default function CareerCoach() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [careerGoals, setCareerGoals] = useState<any>(null)
  const [resumeData, setResumeData] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Load all user data in parallel
      const [profileResult, goalsResult, resumeResult, savedRecsResult] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('career_objectives').select('*').eq('user_id', user?.id).single(),
        supabase.from('resumes').select('ai_analysis, score, created_at').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('career_recommendations').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1)
      ])

      if (profileResult.data) setProfile(profileResult.data)
      if (goalsResult.data) setCareerGoals(goalsResult.data)
      if (resumeResult.data?.[0]) {
        setResumeData(resumeResult.data[0])
      }
      
      // Load saved recommendations if they exist
      if (savedRecsResult.data?.[0]) {
        setRecommendations(savedRecsResult.data[0].recommendations_data)
        setLastGenerated(savedRecsResult.data[0].created_at)
      }

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = async () => {
    if (!careerGoals) {
      setError('Please complete your career goals first')
      return
    }
    
    setGenerating(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerGoals, profile, resumeData })
      })
      
      if (!response.ok) throw new Error('Failed to generate recommendations')
      
      const data = await response.json()
      
      // Save recommendations to database
      await supabase.from('career_recommendations').upsert({
        user_id: user?.id,
        recommendations_data: data,
        confidence_score: data.confidence_score,
        next_review_date: data.next_review_date
      })
      
      setRecommendations(data)
      setLastGenerated(new Date().toISOString())
      
    } catch (error: any) {
      setError(error.message || 'Failed to generate recommendations')
    } finally {
      setGenerating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
      case 'medium': return 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
      case 'low': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'
      default: return 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <CheckCircle className="text-green-600 dark:text-green-500" size={16} />
      case 'moderate': return <Clock className="text-amber-600 dark:text-amber-500" size={16} />
      case 'challenging': return <Zap className="text-red-600 dark:text-red-500" size={16} />
      default: return <Target className="text-slate-600 dark:text-slate-400" size={16} />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 dark:text-green-500'
      case 'medium': return 'text-amber-600 dark:text-amber-500'
      case 'low': return 'text-blue-600 dark:text-blue-500'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  if (authLoading || loading) {
    return (
      <PageLayout>
        <LoadingSkeleton variant="default" />
      </PageLayout>
    )
  }

  if (!user) return null

  if (!careerGoals) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <Target className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Complete Your Career Goals First</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Set up your career objectives to receive personalized AI coaching and strategic recommendations.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              Set Career Goals
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">
              Career Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              AI-powered strategic guidance for your career trajectory
            </p>
          </div>
          
          <button
            onClick={generateRecommendations}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {recommendations ? 'Refresh Analysis' : 'Generate Strategy'}
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600 dark:text-red-500" size={18} />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {recommendations ? (
          <div className="space-y-8">
            {/* Strategy Overview */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Strategic Roadmap</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <BarChart3 size={16} />
                    <span>{recommendations.confidence_score}% confidence</span>
                  </div>
                  {lastGenerated && (
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Generated {new Date(lastGenerated).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority Focus */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <Target size={18} />
                  Priority Focus
                </h3>
                <p className="text-amber-700 dark:text-amber-200 text-lg">{recommendations.priority_focus}</p>
              </div>

              {/* Timeline Roadmap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Next 30 Days
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{recommendations.timeline_roadmap['30_days']}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    90 Days
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{recommendations.timeline_roadmap['90_days']}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    6 Months
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{recommendations.timeline_roadmap['6_months']}</p>
                </div>
              </div>
            </div>

            {/* Strategic Actions */}
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Strategic Actions</h2>
              <div className="space-y-6">
                {recommendations.recommendations.map((rec, i) => (
                  <div key={i} className={`rounded-2xl p-6 border ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{rec.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs rounded-lg border font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800' :
                          rec.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800' :
                          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">{rec.timeline}</span>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 mb-4">{rec.description}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                          Action Steps
                        </h4>
                        <ul className="space-y-2">
                          {rec.specific_actions.map((action, idx) => (
                            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                              <ArrowRight size={12} className="text-blue-600 dark:text-blue-500 mt-1 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getDifficultyIcon(rec.difficulty)}
                            <span className="text-sm text-slate-600 dark:text-slate-400">Difficulty: {rec.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star size={16} className={getImpactColor(rec.impact)} />
                            <span className={`text-sm ${getImpactColor(rec.impact)}`}>
                              {rec.impact} impact
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Success Metric:</p>
                          <p className="text-sm text-green-700 dark:text-green-400">{rec.success_metrics}</p>
                        </div>

                        {rec.resources.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Resources:</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">{rec.resources.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Insights */}
            {recommendations.market_insights && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Market Intelligence
                </h3>
                <p className="text-blue-700 dark:text-blue-200">{recommendations.market_insights}</p>
              </div>
            )}

            {/* Confidence Factors & Red Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.confidence_factors && recommendations.confidence_factors.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-6 rounded-2xl">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Working in Your Favor
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.confidence_factors.map((factor, i) => (
                      <li key={i} className="text-green-700 dark:text-green-200 text-sm flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendations.red_flags && recommendations.red_flags.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-6 rounded-2xl">
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Potential Pitfalls
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.red_flags.map((flag, i) => (
                      <li key={i} className="text-red-700 dark:text-red-200 text-sm flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-500 mt-1">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-6">
              <h3 className="font-semibold text-violet-800 dark:text-violet-300 mb-2 flex items-center gap-2">
                <Lightbulb size={18} />
                Your Immediate Next Step
              </h3>
              <p className="text-violet-700 dark:text-violet-200 text-lg">{recommendations.next_steps}</p>
            </div>
          </div>
        ) : !generating ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Ready for Your AI Career Strategy?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">
              Get personalized recommendations based on your goals, experience, and current market conditions.
            </p>
            <button
              onClick={generateRecommendations}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              Generate My Strategy
            </button>
          </div>
        ) : null}
      </div>
    </PageLayout>
  )
}