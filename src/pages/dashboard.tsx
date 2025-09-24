// src/pages/dashboard.tsx - Clean, focused dashboard
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { User, FileText, Target, Sparkles, TrendingUp, Search, CheckCircle } from 'lucide-react'
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
      const { data, error } = await supabase
        .from('resumes')
        .select('ai_analysis, score, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) return

      if (data && data[0]) {
        const resumeRecord = data[0]
        if (resumeRecord.ai_analysis) {
          setResumeData({
            score: resumeRecord.score,
            created_at: resumeRecord.created_at,
            ...resumeRecord.ai_analysis
          })
        } else {
          setResumeData({
            score: resumeRecord.score,
            created_at: resumeRecord.created_at
          })
        }
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
      // Job stats are optional - don't log errors
    }
  }

  const checkOnboarding = async () => {
    try {
      const { data, error } = await supabase
        .from('career_objectives')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!data || error) {
        router.push('/onboarding')
      } else {
        setHasCompletedOnboarding(true)
      }
    } catch (error) {
      console.error('Error checking onboarding:', error)
      setHasCompletedOnboarding(false)
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

  // Calculate completion status
  const hasProfile = !!profile?.full_name
  const completedSteps = [hasProfile, careerGoals, hasResume].filter(Boolean).length
  const totalSteps = 3

  return (
    <PageLayout>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-8 border border-violet-500/20 mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h2>
        <p className="text-slate-300 text-lg">
          {profile?.current_role || 'Complete your setup to unlock personalized career insights'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Setup Progress */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Setup Progress</h3>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Complete</span>
              <span className="text-slate-400">{completedSteps}/{totalSteps}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center gap-3 ${hasProfile ? 'text-green-400' : 'text-slate-400'}`}>
              <CheckCircle size={16} className={hasProfile ? 'text-green-400' : 'text-slate-600'} />
              <span className="text-sm">Career Profile</span>
            </div>
            <div className={`flex items-center gap-3 ${careerGoals ? 'text-green-400' : 'text-slate-400'}`}>
              <CheckCircle size={16} className={careerGoals ? 'text-green-400' : 'text-slate-600'} />
              <span className="text-sm">Career Goals</span>
            </div>
            <div className={`flex items-center gap-3 ${hasResume ? 'text-green-400' : 'text-slate-400'}`}>
              <CheckCircle size={16} className={hasResume ? 'text-green-400' : 'text-slate-600'} />
              <span className="text-sm">Skills Analysis</span>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          {careerGoals ? (
            <>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="text-violet-400" size={20} />
                Your Career Focus
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              {resumeData && (
                <div className="bg-violet-500/10 rounded-lg p-4 border border-violet-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-300 font-medium">Skills Analysis Complete</p>
                      <p className="text-slate-400 text-sm">
                        Marketability Score: {resumeData.score || resumeData.overall_assessment?.marketability_score || 'N/A'}/100
                      </p>
                    </div>
                    <Link 
                      href="/resume-analyzer"
                      className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg text-violet-300 text-sm transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Target className="h-8 w-8" />}
              title="Set Your Career Goals"
              description="Tell us about your career aspirations to get personalized guidance."
            />
          )}
        </div>
      </div>

      {/* Job Activity Summary - Clean version */}
      {jobStats && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Job Search Activity</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-400">{jobStats.saved_jobs || 0}</p>
                <p className="text-slate-400 text-sm">Saved</p>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{jobStats.applied_jobs || 0}</p>
                <p className="text-slate-400 text-sm">Applied</p>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{jobStats.viewed_jobs || 0}</p>
                <p className="text-slate-400 text-sm">Viewed</p>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {jobStats.viewed_jobs > 0 ? Math.round((jobStats.applied_jobs / jobStats.viewed_jobs) * 100) : 0}%
                </p>
                <p className="text-slate-400 text-sm">Apply Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">What's Next</h3>
        
        {completedSteps === totalSteps ? (
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
            <h4 className="font-semibold text-green-300 mb-2">🎉 Setup Complete!</h4>
            <p className="text-green-100 mb-4">You're all set up! Explore your personalized career insights and start applying to jobs.</p>
            <div className="flex gap-4">
              <Link 
                href="/resume-analyzer"
                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-300 text-sm transition-colors"
              >
                View Skills Analysis
              </Link>
              <Link 
                href="/jobs"
                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-300 text-sm transition-colors"
              >
                Find Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-300 mb-2">Complete Your Setup</h4>
            <p className="text-yellow-100 mb-4">
              {!hasProfile && "Start by setting up your career profile."}
              {hasProfile && !careerGoals && "Next, define your career goals."}
              {hasProfile && careerGoals && !hasResume && "Finally, upload your resume for skills analysis."}
            </p>
            <div className="flex gap-4">
              {!hasProfile && (
                <Link 
                  href="/profile"
                  className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg text-yellow-300 text-sm transition-colors"
                >
                  Create Profile
                </Link>
              )}
              {hasProfile && !careerGoals && (
                <Link 
                  href="/onboarding"
                  className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg text-yellow-300 text-sm transition-colors"
                >
                  Set Career Goals
                </Link>
              )}
              {hasProfile && careerGoals && !hasResume && (
                <Link 
                  href="/resume-analyzer"
                  className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg text-yellow-300 text-sm transition-colors"
                >
                  Analyze Resume
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

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
            <h3 className="text-lg font-bold text-white mb-2">Skills Intelligence</h3>
            <p className="text-slate-400 text-sm">
              {resumeData ? 
                `Resume analyzed - ${resumeData.score}/100 score` :
                'Get AI-powered skills analysis'
              }
            </p>
            {resumeData?.created_at && (
              <p className="text-slate-500 text-xs mt-1">
                Last analyzed: {new Date(resumeData.created_at).toLocaleDateString()}
              </p>
            )}
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