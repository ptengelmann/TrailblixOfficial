// src/pages/dashboard.tsx - Tabbed dashboard with interactive guidance
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { usePredictivePrefetch } from '@/lib/prefetch'
import Link from 'next/link'
import {
  User,
  FileText,
  Target,
  Search,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Home,
  Activity,
  Users,
  Brain,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ProgressWidgets from '@/components/dashboard/ProgressWidgets'
import NetworkingTracker from '@/components/NetworkingTracker'
import DailyTasks from '@/components/dashboard/DailyTasks'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import CareerInsights from '@/components/dashboard/CareerInsights'
import { logger } from '@/lib/logger'
import type { UserProfile, CareerObjectives } from '@/types/api'

interface ResumeData {
  score: number
  created_at: string
  overall_assessment?: {
    marketability_score?: number
  }
  [key: string]: unknown
}

interface JobStats {
  saved_jobs: number
  applied_jobs: number
  viewed_jobs: number
}

type TabType = 'overview' | 'activity' | 'networking' | 'insights'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Enable predictive prefetching
  usePredictivePrefetch(user?.id)

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [careerGoals, setCareerGoals] = useState<CareerObjectives | null>(null)
  const [hasResume, setHasResume] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [jobStats, setJobStats] = useState<JobStats | null>(null)
  const [showProgressTracking, setShowProgressTracking] = useState(false)

  const loadProfile = useCallback(async () => {
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
      logger.error('Failed to load user profile', 'DATABASE', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setProfileLoading(false)
    }
  }, [user?.id])

  const loadCareerGoals = useCallback(async () => {
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
      logger.error('Failed to load career goals', 'DATABASE', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [user?.id])

  const checkResume = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1)

      setHasResume(!!data && data.length > 0)
    } catch (error) {
      logger.error('Failed to check resume status', 'DATABASE', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [user?.id])

  const loadLatestResume = useCallback(async () => {
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
            score: resumeRecord.score || 0,
            created_at: resumeRecord.created_at,
            ...resumeRecord.ai_analysis as Record<string, unknown>
          })
        } else {
          setResumeData({
            score: resumeRecord.score || 0,
            created_at: resumeRecord.created_at
          })
        }
      }
    } catch (error) {
      logger.error('Failed to load resume data', 'DATABASE', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [user?.id])

  const loadJobStats = useCallback(async () => {
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
        setJobStats(data.summary || { saved_jobs: 0, applied_jobs: 0, viewed_jobs: 0 })
      }
    } catch (error) {
      // Job stats are optional - don't log errors
    }
  }, [])

  const createDefaultMilestones = useCallback(async (careerObjectives: CareerObjectives) => {
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
      logger.error('Failed to create default milestones', 'DATABASE', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [user?.id])

  const initializeProgressTracking = useCallback(async () => {
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
      logger.error('Failed to initialize progress tracking', 'DATABASE', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [user?.id, createDefaultMilestones])

  const checkOnboarding = useCallback(async () => {
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
      logger.error('Failed to check onboarding status', 'DATABASE', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setHasCompletedOnboarding(false)
    }
  }, [user?.id, router])

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
  }, [user, loadProfile, checkOnboarding, loadCareerGoals, checkResume, loadLatestResume, loadJobStats, initializeProgressTracking])

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

  // Get next step
  const getNextStep = () => {
    if (!hasProfile) return { text: "Set up your career profile", href: "/profile", icon: User }
    if (!careerGoals) return { text: "Define your career goals", href: "/profile", icon: Target }
    if (!hasResume) return { text: "Analyze your resume", href: "/resume-analyzer", icon: FileText }
    return null
  }

  const nextStep = getNextStep()

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: Home },
    { id: 'activity' as TabType, name: 'Activity', icon: Activity },
    { id: 'networking' as TabType, name: 'Networking', icon: Users },
    { id: 'insights' as TabType, name: 'Insights', icon: Brain },
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {profile?.current_role || 'Complete your setup to unlock personalized career insights'}
          </p>
        </div>

        {/* Interactive Progress Guidance */}
        {!isSetupComplete && nextStep && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                    <AlertCircle className="text-blue-600 dark:text-blue-500" size={16} />
                  </div>
                  <div>
                    <p className="text-blue-900 dark:text-blue-100 font-medium">Next Step</p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">{nextStep.text}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center text-slate-400 dark:text-slate-600">
                  <span className="text-sm">{completedSteps}/{totalSteps} completed</span>
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 ml-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link
                href={nextStep.href}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <nextStep.icon size={16} />
                Continue Setup
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Setup Complete Banner */}
        {isSetupComplete && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-500" size={16} />
                </div>
                <div>
                  <p className="text-green-900 dark:text-green-100 font-medium">
                    {showProgressTracking ? 'Career Tracking Active!' : 'Setup Complete!'}
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    {showProgressTracking
                      ? 'Your progress is being tracked. Stay consistent to maintain momentum.'
                      : 'Explore your personalized career insights and start applying to jobs.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/jobs"
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm font-medium transition-colors"
                >
                  Find Jobs
                </Link>
                {isSetupComplete && (
                  <Link
                    href="/intelligence-dashboard"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    AI Insights →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Overview Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <User className="text-blue-600 dark:text-blue-500" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Profile</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {profile?.full_name ? 'Update info' : 'Set up profile'}
                        </p>
                      </div>
                    </Link>

                    <Link href="/resume-analyzer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <FileText className="text-blue-600 dark:text-blue-500" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Resume</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {resumeData ? `Score: ${resumeData.score}/100` : 'Analyze resume'}
                        </p>
                      </div>
                    </Link>

                    <Link href="/jobs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Search className="text-blue-600 dark:text-blue-500" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Job Search</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Find opportunities</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Career Focus */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  {careerGoals ? (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                          <Target className="text-blue-600 dark:text-blue-500" size={16} />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Career Focus</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {careerGoals.target_role && (
                          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-2">Target Role</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{careerGoals.target_role}</p>
                          </div>
                        )}

                        {careerGoals.primary_goal && (
                          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-2">Primary Goal</p>
                            <p className="font-semibold text-slate-900 dark:text-white capitalize">{careerGoals.primary_goal.replace('_', ' ')}</p>
                          </div>
                        )}

                        {careerGoals.timeline && (
                          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-2">Timeline</p>
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
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Set Your Career Goals</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">Tell us about your career aspirations to get personalized guidance.</p>
                      <Link href="/profile" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Stats & Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Activity */}
                {jobStats && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Job Activity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-500 mb-1">{jobStats.saved_jobs || 0}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Saved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-500 mb-1">{jobStats.applied_jobs || 0}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Applied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-500 mb-1">{jobStats.viewed_jobs || 0}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Viewed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-1">
                          {jobStats.viewed_jobs > 0 ? Math.round((jobStats.applied_jobs / jobStats.viewed_jobs) * 100) : 0}%
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Apply Rate</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Widget */}
                {showProgressTracking && isSetupComplete && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="text-blue-600 dark:text-blue-500" size={16} />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Career Progress</h3>
                    </div>
                    <ProgressWidgets userId={user.id} />
                  </div>
                )}
              </div>

              {/* Daily Tasks */}
              {isSetupComplete && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <DailyTasks />
                </div>
              )}
            </>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <ActivityFeed />
            </div>
          )}

          {activeTab === 'networking' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <NetworkingTracker />
            </div>
          )}

          {activeTab === 'insights' && (
            <>
              {isSetupComplete ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <CareerInsights />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
                  <Brain className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Complete Setup for Insights</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Finish setting up your profile to unlock personalized career insights and AI-powered recommendations.
                  </p>
                  <Link href="/profile" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Complete Setup
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  )
}