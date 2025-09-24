// src/pages/dashboard.tsx - Updated with job matching integration
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { User, FileText, Target, Sparkles, TrendingUp, Search, Bookmark, Send, Eye } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ProfileCompletion from '@/components/ProfileCompletion'
import EmptyState from '@/components/EmptyState'

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
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [careerGoals, setCareerGoals] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [resumeData, setResumeData] = useState<any>(null)
  const [jobStats, setJobStats] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadProfile()
      checkOnboarding()
      loadCareerGoals()
      checkResume()
      loadLatestResume()
      loadJobStats()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const loadCareerGoals = async () => {
    try {
      const { data } = await supabase
        .from('career_objectives')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setCareerGoals(data)
      }
    } catch (error) {
      console.error('Error loading career goals:', error)
    }
  }

  const checkResume = async () => {
    try {
      const { data } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1)

      setHasResume(!!data && data.length > 0)
    } catch (error) {
      console.error('Error checking resume:', error)
    }
  }

  const loadLatestResume = async () => {
    try {
      const { data } = await supabase
        .from('resumes')
        .select('ai_analysis, score')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data[0]) {
        setResumeData({
          score: data[0].score,
          ...data[0].ai_analysis
        })
      }
    } catch (error) {
      console.error('Error loading resume data:', error)
    }
  }

  const loadJobStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/jobs/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'list',
          limit: 1
        })
      })

      if (response.ok) {
        const data = await response.json()
        setJobStats(data.summary)
      }
    } catch (error) {
      console.error('Error loading job stats:', error)
    }
  }

  const checkOnboarding = async () => {
    try {
      const { data } = await supabase
        .from('career_objectives')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!data) {
        router.push('/onboarding')
      } else {
        setHasCompletedOnboarding(true)
      }
    } catch (error) {
      console.error('Error checking onboarding:', error)
      setHasCompletedOnboarding(false)
    }
  }

  const generateRecommendations = async () => {
    if (!careerGoals) return
    
    setLoadingRecs(true)
    try {
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerGoals, profile, resumeData })
      })
      
      const data = await response.json()
      setRecommendations(data)
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setLoadingRecs(false)
    }
  }

  if (loading || profileLoading || hasCompletedOnboarding === null) {
    return (
      <PageLayout>
        <LoadingSkeleton variant="dashboard" />
      </PageLayout>
    )
  }

  if (!user) return null

  return (
    <PageLayout>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-8 border border-violet-500/20 mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h2>
        <p className="text-slate-300 text-lg">
          {profile?.current_role || 'Complete your profile to unlock personalized career insights'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Completion */}
        <ProfileCompletion 
          profile={profile} 
          careerGoals={careerGoals} 
          hasResume={hasResume}
        />

        {/* Career Goals Summary */}
        {careerGoals && (
          <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="text-violet-400" size={20} />
                Your Career Goals
              </h3>
              <button
                onClick={() => router.push('/onboarding')}
                className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
              >
                Edit →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {careerGoals.target_role && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Target Role</p>
                  <p className="font-semibold text-white">{careerGoals.target_role}</p>
                </div>
              )}
              
              {careerGoals.primary_goal && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Primary Goal</p>
                  <p className="font-semibold text-white capitalize">{careerGoals.primary_goal.replace('_', ' ')}</p>
                </div>
              )}
              
              {careerGoals.timeline && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Timeline</p>
                  <p className="font-semibold text-white capitalize">{careerGoals.timeline}-term</p>
                </div>
              )}
            </div>

            <button
              onClick={generateRecommendations}
              disabled={loadingRecs}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-white"
            >
              <Sparkles size={18} />
              {loadingRecs ? 'Generating Strategy...' : 'Get AI Career Strategy'}
            </button>
          </div>
        )}
      </div>

      {/* Job Activity Stats */}
      {jobStats && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Job Search Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Saved Jobs</p>
                  <p className="text-xl font-bold text-white">{jobStats.saved_jobs || 0}</p>
                </div>
                <Bookmark className="h-6 w-6 text-violet-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Applied</p>
                  <p className="text-xl font-bold text-white">{jobStats.applied_jobs || 0}</p>
                </div>
                <Send className="h-6 w-6 text-green-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Viewed</p>
                  <p className="text-xl font-bold text-white">{jobStats.viewed_jobs || 0}</p>
                </div>
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Application Rate</p>
                  <p className="text-xl font-bold text-white">
                    {jobStats.viewed_jobs > 0 ? Math.round((jobStats.applied_jobs / jobStats.viewed_jobs) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations ? (
        <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/20 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="text-violet-400" size={20} />
              AI-Powered Career Strategy
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 bg-slate-800/40 px-2 py-1 rounded">
                {recommendations.confidence_score}% confidence
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/40 px-2 py-1 rounded">
                Updated {new Date(recommendations.generated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Priority Focus */}
          {recommendations.priority_focus && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <h4 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                🎯 Priority Focus
              </h4>
              <p className="text-yellow-100">{recommendations.priority_focus}</p>
            </div>
          )}

          {/* Market Insights */}
          {recommendations.market_insights && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                📊 Market Intelligence
              </h4>
              <p className="text-blue-100">{recommendations.market_insights}</p>
            </div>
          )}

          {/* Timeline Roadmap */}
          {recommendations.timeline_roadmap && (
            <div className="mb-6">
              <h4 className="font-semibold text-white mb-4">📅 Your Career Roadmap</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 p-4 rounded-lg border border-green-800/30">
                  <h5 className="font-semibold text-green-400 mb-2">Next 30 Days</h5>
                  <p className="text-slate-300 text-sm">{recommendations.timeline_roadmap['30_days']}</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-800/30">
                  <h5 className="font-semibold text-blue-400 mb-2">90 Days</h5>
                  <p className="text-slate-300 text-sm">{recommendations.timeline_roadmap['90_days']}</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-lg border border-purple-800/30">
                  <h5 className="font-semibold text-purple-400 mb-2">6 Months</h5>
                  <p className="text-slate-300 text-sm">{recommendations.timeline_roadmap['6_months']}</p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Recommendations */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-white">🚀 Strategic Actions</h4>
            {recommendations.recommendations.map((rec, i) => (
              <div key={i} className="bg-slate-800/60 p-5 rounded-lg border border-slate-700/30">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-semibold text-white">{rec.title}</h5>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      rec.priority === 'high' ? 'bg-red-900/40 text-red-300 border border-red-800/30' :
                      rec.priority === 'medium' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-800/30' :
                      'bg-blue-900/40 text-blue-300 border border-blue-800/30'
                    }`}>
                      {rec.priority} priority
                    </span>
                    {rec.timeline && (
                      <span className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded border border-slate-600/30">
                        {rec.timeline}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      rec.impact === 'high' ? 'bg-green-900/40 text-green-300 border border-green-800/30' :
                      rec.impact === 'medium' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-800/30' :
                      'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                    }`}>
                      {rec.impact} impact
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-4">{rec.description}</p>
                
                {rec.specific_actions && rec.specific_actions.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-slate-400 mb-2">Action Steps:</h6>
                    <ul className="space-y-2">
                      {rec.specific_actions.map((action, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-violet-400 mt-1 font-bold">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                  {rec.success_metrics && (
                    <div>
                      <span className="text-green-400 font-medium">Success Metric: </span>
                      <span className="text-slate-300">{rec.success_metrics}</span>
                    </div>
                  )}
                  
                  {rec.resources && rec.resources.length > 0 && (
                    <div>
                      <span className="text-blue-400 font-medium">Resources: </span>
                      <span className="text-slate-300">{rec.resources.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Confidence Factors & Red Flags */}
          {(recommendations.confidence_factors?.length > 0 || recommendations.red_flags?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {recommendations.confidence_factors && recommendations.confidence_factors.length > 0 && (
                <div className="bg-green-900/20 border border-green-600/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-2">✅ Working in Your Favor</h4>
                  <ul className="space-y-1">
                    {recommendations.confidence_factors.map((factor, i) => (
                      <li key={i} className="text-green-100 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendations.red_flags && recommendations.red_flags.length > 0 && (
                <div className="bg-red-900/20 border border-red-600/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-300 mb-2">⚠️ Potential Pitfalls</h4>
                  <ul className="space-y-1">
                    {recommendations.red_flags.map((flag, i) => (
                      <li key={i} className="text-red-100 text-sm flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          {recommendations.next_steps && (
            <div className="bg-violet-900/20 border border-violet-600/30 p-4 rounded-lg">
              <h4 className="font-semibold text-violet-300 mb-2">🚀 Your Immediate Next Step</h4>
              <p className="text-violet-100">{recommendations.next_steps}</p>
            </div>
          )}
        </div>
      ) : careerGoals ? (
        <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/20 mb-8">
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="Ready for your career strategy?"
            description="Click 'Get AI Career Strategy' above to receive comprehensive, personalized guidance based on your goals and resume analysis."
          />
        </div>
      ) : null}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/profile" className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-violet-500/50 transition-all hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
              <User className="text-violet-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Career Profile</h3>
            <p className="text-slate-400 text-sm">
              {profile?.full_name ? 'Update your information' : 'Set up your career profile'}
            </p>
          </Link>

          <Link href="/resume-analyzer" className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-violet-500/50 transition-all hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
              <FileText className="text-violet-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resume Analyzer</h3>
            <p className="text-slate-400 text-sm">
              {resumeData ? `Last score: ${resumeData.score}/100` : 'Get AI-powered feedback on your resume'}
            </p>
          </Link>

          <Link href="/jobs" className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-violet-500/50 transition-all hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
              <Search className="text-violet-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Job Search</h3>
            <p className="text-slate-400 text-sm">
              Find AI-matched opportunities based on your career goals
            </p>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}