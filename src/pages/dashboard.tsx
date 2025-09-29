// src/pages/dashboard.tsx - Clean layout with original aesthetic preserved
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { User, FileText, Target, Sparkles, TrendingUp, Search, CheckCircle, Calendar } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import ProgressWidgets from '@/components/dashboard/ProgressWidgets'
import NetworkingTracker from '@/components/NetworkingTracker'
import DailyTasks from '@/components/dashboard/DailyTasks'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import CareerInsights from '@/components/dashboard/CareerInsights'
import { logger } from '@/lib/logger'

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
  const [showProgressTracking, setShowProgressTracking] = useState(false)

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
      initializeProgressTracking()
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
      logger.error('Failed to load user profile', 'DATABASE', { userId: user?.id, error: error.message })
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
      logger.error('Failed to load career goals', 'DATABASE', { userId: user?.id, error: error.message })
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
      logger.error('Failed to check resume status', 'DATABASE', { userId: user?.id, error: error.message })
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
      logger.error('Failed to load resume data', 'DATABASE', { userId: user?.id, error: error.message })
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

  const initializeProgressTracking = async () => {
    try {
      const { data } = await supabase
        .from('career_objectives')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setShowProgressTracking(true)
        
        const { data: existingMilestones } = await supabase
          .from('career_milestones')
          .select('id')
          .eq('user_id', user?.id)
          .limit(1)

        if (!existingMilestones || existingMilestones.length === 0) {
          await createDefaultMilestones(data)
        }
      }
    } catch (error) {
      logger.error('Failed to initialize progress tracking', 'DATABASE', { userId: user?.id, error: error.message })
    }
  }

  const createDefaultMilestones = async (careerObjectives: Record<string, unknown>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      let weeklyApplications = 3
      if (careerObjectives.timeline === 'immediate') weeklyApplications = 8
      else if (careerObjectives.timeline === 'short') weeklyApplications = 5
      else if (careerObjectives.timeline === 'medium') weeklyApplications = 3
      else if (careerObjectives.timeline === 'long') weeklyApplications = 2

      const monthlyApplications = weeklyApplications * 4

      const defaultMilestones = [
        {
          user_id: user?.id,
          career_objective_id: careerObjectives.id,
          milestone_type: 'application_goal',
          title: 'Monthly Application Target',
          description: `Apply to ${monthlyApplications} relevant positions this month`,
          target_value: monthlyApplications,
          current_value: 0,
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active'
        },
        {
          user_id: user?.id,
          career_objective_id: careerObjectives.id,
          milestone_type: 'networking',
          title: 'Monthly Networking Goal',
          description: 'Connect with professionals in your target industry',
          target_value: 8,
          current_value: 0,
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active'
        }
      ]

      await supabase
        .from('career_milestones')
        .insert(defaultMilestones)

      await fetch('/api/career-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'track_activity',
          activity_type: 'goal_set',
          activity_data: { milestones_created: defaultMilestones.length }
        })
      })

    } catch (error) {
      logger.error('Failed to create default milestones', 'DATABASE', { userId: user?.id, error: error.message })
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
      logger.error('Failed to check onboarding status', 'DATABASE', { userId: user?.id, error: error.message })
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
  const isSetupComplete = completedSteps === totalSteps

  return (
    <PageLayout>
      {/* Welcome Section */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-2">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {profile?.current_role || 'Complete your setup to unlock personalized career insights'}
            </p>
          </div>
          {isSetupComplete && (
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
        {/* Progress Tracking - Only show when setup is complete */}
        {showProgressTracking && isSetupComplete && (
          <div className="xl:col-span-1">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Career Progress</h3>
            <ProgressWidgets userId={user.id} />
          </div>
        )}

        {/* Main Content Area */}
        <div className={`${showProgressTracking && isSetupComplete ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          {/* Daily Tasks - Show when setup is complete */}
          {isSetupComplete && (
            <div className="mb-8">
              <DailyTasks />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Setup Progress - Hide when complete and progress tracking is enabled */}
            {!(showProgressTracking && isSetupComplete) && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Setup Progress</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Complete</span>
                    <span className="text-slate-600 dark:text-slate-400">{completedSteps}/{totalSteps}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${hasProfile ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-600'}`}>
                    <CheckCircle size={16} className={hasProfile ? 'text-green-600 dark:text-green-500' : 'text-slate-300 dark:text-slate-600'} />
                    <span className="text-sm font-medium">Career Profile</span>
                  </div>
                  <div className={`flex items-center gap-3 ${careerGoals ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-600'}`}>
                    <CheckCircle size={16} className={careerGoals ? 'text-green-600 dark:text-green-500' : 'text-slate-300 dark:text-slate-600'} />
                    <span className="text-sm font-medium">Career Goals</span>
                  </div>
                  <div className={`flex items-center gap-3 ${hasResume ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-600'}`}>
                    <CheckCircle size={16} className={hasResume ? 'text-green-600 dark:text-green-500' : 'text-slate-300 dark:text-slate-600'} />
                    <span className="text-sm font-medium">Skills Analysis</span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className={`${!(showProgressTracking && isSetupComplete) ? 'lg:col-span-2' : 'lg:col-span-3'} bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800`}>
              {careerGoals ? (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="text-blue-600" size={20} />
                    Your Career Focus
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {careerGoals.target_role && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-1">Target Role</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{careerGoals.target_role}</p>
                      </div>
                    )}
                    
                    {careerGoals.primary_goal && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-1">Primary Goal</p>
                        <p className="font-semibold text-slate-900 dark:text-white capitalize">{careerGoals.primary_goal.replace('_', ' ')}</p>
                      </div>
                    )}
                    
                    {careerGoals.timeline && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-1">Timeline</p>
                        <p className="font-semibold text-slate-900 dark:text-white capitalize">{careerGoals.timeline}-term</p>
                      </div>
                    )}
                  </div>

                  {resumeData && (
                    <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-700 dark:text-blue-400 font-medium">Skills Analysis Complete</p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Marketability Score: {resumeData.score || resumeData.overall_assessment?.marketability_score || 'N/A'}/100
                          </p>
                        </div>
                        <Link 
                          href="/resume-analyzer"
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm font-medium transition-colors"
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

          {/* Job Activity Summary */}
          {jobStats && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Job Search Activity</h3>
                {showProgressTracking && (
                  <Link href="/career-coach" className="text-blue-600 dark:text-blue-500 text-sm font-medium hover:underline">
                    View detailed insights →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-500 mb-1">{jobStats.saved_jobs || 0}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Saved</p>
                  {showProgressTracking && (
                    <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">This week</p>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500 mb-1">{jobStats.applied_jobs || 0}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Applied</p>
                  {showProgressTracking && (
                    <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">This week</p>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-500 mb-1">{jobStats.viewed_jobs || 0}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Viewed</p>
                  {showProgressTracking && (
                    <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">This week</p>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-1">
                    {jobStats.viewed_jobs > 0 ? Math.round((jobStats.applied_jobs / jobStats.viewed_jobs) * 100) : 0}%
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Apply Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Networking and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <NetworkingTracker />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>

          {/* Career Insights */}
          {isSetupComplete && (
            <div className="mb-8">
              <CareerInsights />
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">What&apos;s Next</h3>
            
            {completedSteps === totalSteps ? (
              <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  {showProgressTracking ? 'Career Tracking Active!' : 'Setup Complete!'}
                </h4>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  {showProgressTracking ? 
                    'Your progress is being tracked. Stay consistent with your job search activities to maintain momentum.' :
                    'You\'re all set up! Explore your personalized career insights and start applying to jobs.'
                  }
                </p>
                <div className="flex gap-4">
                  {showProgressTracking ? (
                    <>
                      <Link 
                        href="/jobs"
                        className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm font-medium transition-colors"
                      >
                        Apply to Jobs
                      </Link>
                      <Link 
                        href="/career-coach"
                        className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm font-medium transition-colors"
                      >
                        View Weekly Strategy
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/resume-analyzer"
                        className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm font-medium transition-colors"
                      >
                        View Skills Analysis
                      </Link>
                      <Link 
                        href="/jobs"
                        className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm font-medium transition-colors"
                      >
                        Find Jobs
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Complete Your Setup</h4>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  {!hasProfile && "Start by setting up your career profile."}
                  {hasProfile && !careerGoals && "Next, define your career goals."}
                  {hasProfile && careerGoals && !hasResume && "Finally, upload your resume for skills analysis."}
                </p>
                <div className="flex gap-4">
                  {!hasProfile && (
                    <Link 
                      href="/profile"
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-sm font-medium transition-colors"
                    >
                      Create Profile
                    </Link>
                  )}
                  {hasProfile && !careerGoals && (
                    <Link 
                      href="/profile"
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-sm font-medium transition-colors"
                    >
                      Set Career Goals
                    </Link>
                  )}
                  {hasProfile && careerGoals && !hasResume && (
                    <Link 
                      href="/resume-analyzer"
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-sm font-medium transition-colors"
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
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/profile" className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <User className="text-blue-600 dark:text-blue-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Career Profile</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {profile?.full_name ? 'Update your information' : 'Set up your career profile'}
                </p>
              </Link>

              <Link href="/resume-analyzer" className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <FileText className="text-blue-600 dark:text-blue-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Skills Intelligence</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {resumeData ? 
                    `Resume analyzed - ${resumeData.score}/100 score` :
                    'Get AI-powered skills analysis'
                  }
                </p>
                {resumeData?.created_at && (
                  <p className="text-slate-500 dark:text-slate-600 text-xs mt-1">
                    Last analyzed: {new Date(resumeData.created_at).toLocaleDateString()}
                  </p>
                )}
              </Link>

              <Link href="/jobs" className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Search className="text-blue-600 dark:text-blue-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Job Search</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Find AI-matched opportunities based on your career goals
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}