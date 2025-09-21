// src/pages/dashboard.tsx
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { User, FileText, Target, Sparkles, TrendingUp } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ProfileCompletion from '@/components/ProfileCompletion'
import EmptyState from '@/components/EmptyState'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [careerGoals, setCareerGoals] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [hasResume, setHasResume] = useState(false)

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
        body: JSON.stringify({ careerGoals, profile })
      })
      
      const data = await response.json()
      setRecommendations(data.recommendations || [])
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
              {loadingRecs ? 'Generating...' : 'Get AI Recommendations'}
            </button>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 ? (
        <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/20 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Sparkles className="text-violet-400" size={20} />
            AI-Powered Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/40 p-4 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <span className="text-violet-400 text-sm font-bold">{i + 1}</span>
                </div>
                <p className="text-slate-200">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      ) : careerGoals ? (
        <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/20 mb-8">
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="No recommendations yet"
            description="Click 'Get AI Recommendations' above to receive personalized career guidance based on your goals."
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
            <p className="text-slate-400 text-sm">Get AI-powered feedback on your resume</p>
          </Link>

          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 opacity-50">
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="text-slate-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Job Matching</h3>
            <p className="text-slate-400 text-sm">Coming soon...</p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}