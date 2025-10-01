// src/pages/saved-jobs.tsx - Enhanced with Applied Jobs tab
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { logger } from '@/lib/logger'
import {
  Bookmark, ExternalLink, Trash2, Star, Building, MapPin,
  DollarSign, Clock, Eye, Send, Edit3, FileText,
  ChevronRight, TrendingUp, AlertTriangle, CheckCircle,
  Check, RotateCcw, RefreshCw
} from 'lucide-react'
// Define job sources directly since we removed the types file
type JobSource = 'adzuna' | 'jsearch' | 'reed' | 'github' | 'remoteok'

interface SavedJob {
  id: string
  job_id: string
  job_data: {
    id: string
    title: string
    company: {
      display_name: string
      logo_url?: string
    }
    location: {
      display_name: string
    }
    description: string
    salary_formatted?: string
    redirect_url: string
    source?: JobSource
    ai_insights?: {
      match_score: number
      career_growth_potential: string
      skills_alignment: number
      match_reasoning: string[]
    }
    salary_benchmarks?: {
      percentile_25: number
      percentile_50: number
      percentile_75: number
      market_position: 'below' | 'average' | 'above'
    }
    company_insights?: {
      rating?: number
      culture_score?: number
      work_life_balance?: number
      compensation_rating?: number
      review_count?: number
    }
  }
  interaction_type: string
  ai_match_score?: number
  match_analysis?: {
    analysis?: {
      overall_assessment?: string
      strengths?: string[]
      concerns?: string[]
    }
  }
  notes?: string
  pipeline_stage?: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  priority?: 'low' | 'medium' | 'high'
  application_status?: string
  created_at: string
  updated_at: string
}

interface JobStats {
  total_interactions: number
  saved_jobs: number
  applied_jobs: number
  viewed_jobs: number
}

type TabType = 'saved' | 'applied'

export default function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [appliedJobs, setAppliedJobs] = useState<SavedJob[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('saved')
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [processingJobs, setProcessingJobs] = useState<Set<string>>(new Set())

  const loadJobData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Load both saved and applied jobs
      const [savedResponse, appliedResponse] = await Promise.all([
        fetch('/api/jobs/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            action: 'list',
            interaction_type: 'saved',
            include_ai_analysis: true,
            limit: 50
          })
        }),
        fetch('/api/jobs/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            action: 'list',
            interaction_type: 'applied',
            include_ai_analysis: true,
            limit: 50
          })
        })
      ])

      if (savedResponse.ok && appliedResponse.ok) {
        const savedData = await savedResponse.json()
        const appliedData = await appliedResponse.json()
        
        setSavedJobs(savedData.interactions || [])
        setAppliedJobs(appliedData.interactions || [])
        setStats(savedData.summary) // Use saved data summary for overall stats
      }
    } catch (error) {
      logger.error('Failed to load saved jobs data', 'DATABASE', { userId: user?.id, error: error.message })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadJobData()
    }
  }, [user, loadJobData])

  // Refresh data when page becomes visible (e.g., navigating back from job search)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadJobData()
      }
    }

    const handleFocus = () => {
      if (user) {
        loadJobData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, loadJobData])

  // Refresh data when router changes (navigating to this page)
  useEffect(() => {
    const handleRouteChange = () => {
      if (user) {
        loadJobData()
      }
    }

    router.events?.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange)
    }
  }, [user, router, loadJobData])

  const removeJob = async (jobId: string, fromTab: TabType) => {
    setProcessingJobs(prev => new Set([...prev, jobId]))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/jobs/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'delete',
          job_id: jobId,
          interaction_type: fromTab
        })
      })

      if (response.ok) {
        if (fromTab === 'saved') {
          setSavedJobs(prev => prev.filter(job => job.job_id !== jobId))
        } else {
          setAppliedJobs(prev => prev.filter(job => job.job_id !== jobId))
        }
        
        if (stats) {
          setStats(prev => prev ? { 
            ...prev, 
            [fromTab === 'saved' ? 'saved_jobs' : 'applied_jobs']: prev[fromTab === 'saved' ? 'saved_jobs' : 'applied_jobs'] - 1 
          } : null)
        }
      }
    } catch (error) {
      logger.error('Failed to remove job from saved', 'API', { jobId, error: error.message })
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  const markAsApplied = async (job: SavedJob) => {
    setProcessingJobs(prev => new Set([...prev, job.job_id]))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/jobs/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'create',
          job_id: job.job_id,
          job_data: job.job_data,
          interaction_type: 'applied'
        })
      })

      if (response.ok) {
        // Move job from saved to applied
        setSavedJobs(prev => prev.filter(j => j.job_id !== job.job_id))
        setAppliedJobs(prev => [...prev, { ...job, interaction_type: 'applied', created_at: new Date().toISOString() }])
        
        // Update stats
        if (stats) {
          setStats(prev => prev ? { 
            ...prev, 
            saved_jobs: prev.saved_jobs - 1,
            applied_jobs: prev.applied_jobs + 1
          } : null)
        }
      }
    } catch (error) {
      logger.error('Failed to mark job as applied', 'API', { jobId, error: error.message })
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(job.job_id)
        return newSet
      })
    }
  }

  const moveBackToSaved = async (job: SavedJob) => {
    setProcessingJobs(prev => new Set([...prev, job.job_id]))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Delete applied interaction and create saved interaction
      await Promise.all([
        fetch('/api/jobs/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            action: 'delete',
            job_id: job.job_id,
            interaction_type: 'applied'
          })
        }),
        fetch('/api/jobs/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            action: 'create',
            job_id: job.job_id,
            job_data: job.job_data,
            interaction_type: 'saved'
          })
        })
      ])

      // Move job from applied to saved
      setAppliedJobs(prev => prev.filter(j => j.job_id !== job.job_id))
      setSavedJobs(prev => [...prev, { ...job, interaction_type: 'saved', created_at: new Date().toISOString() }])
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? { 
          ...prev, 
          saved_jobs: prev.saved_jobs + 1,
          applied_jobs: prev.applied_jobs - 1
        } : null)
      }
    } catch (error) {
      logger.error('Failed to move job back to saved', 'API', { jobId, error: error.message })
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(job.job_id)
        return newSet
      })
    }
  }

  const updateNotes = async (jobId: string, newNotes: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/jobs/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'update',
          job_id: jobId,
          notes: newNotes
        })
      })

      if (response.ok) {
        // Update notes in both saved and applied jobs
        setSavedJobs(prev => 
          prev.map(job => 
            job.job_id === jobId ? { ...job, notes: newNotes } : job
          )
        )
        setAppliedJobs(prev => 
          prev.map(job => 
            job.job_id === jobId ? { ...job, notes: newNotes } : job
          )
        )
        setEditingNotes(null)
      }
    } catch (error) {
      logger.error('Failed to update job notes', 'API', { jobId, error: error.message })
    }
  }

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'text-slate-600 dark:text-slate-400'
    if (score >= 80) return 'text-green-600 dark:text-green-500'
    if (score >= 60) return 'text-amber-600 dark:text-amber-500'
    return 'text-red-600 dark:text-red-500'
  }

  const formatTimeAgo = (dateString: string, prefix: string = 'Saved') => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return `${prefix} today`
    if (diffDays === 1) return `${prefix} yesterday`
    return `${prefix} ${diffDays} days ago`
  }

  const renderJobCard = (savedJob: SavedJob, isApplied: boolean = false) => {
    const job = savedJob.job_data
    const isProcessing = processingJobs.has(savedJob.job_id)
    
    return (
      <div
        key={savedJob.id}
        className={`bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border transition-all ${
          isApplied 
            ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20' 
            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {job.title}
              </h3>
              {isApplied && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-1">
                  <Check size={12} />
                  Applied
                </span>
              )}
              {savedJob.ai_match_score && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <Star size={14} className={getMatchScoreColor(savedJob.ai_match_score)} />
                  <span className={`text-sm font-medium ${getMatchScoreColor(savedJob.ai_match_score)}`}>
                    {savedJob.ai_match_score}% match
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 mb-3">
              <div className="flex items-center gap-1">
                <Building size={16} />
                {job.company?.display_name}
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {job.location?.display_name}
              </div>
              {job.salary_formatted && (
                <div className="flex items-center gap-1">
                  <DollarSign size={16} />
                  {job.salary_formatted}
                </div>
              )}
              <div className={`flex items-center gap-1 ${isApplied ? 'text-green-600 dark:text-green-500' : 'text-blue-600 dark:text-blue-500'}`}>
                <Clock size={16} />
                {formatTimeAgo(savedJob.created_at, isApplied ? 'Applied' : 'Saved')}
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
              {job.description?.substring(0, 200)}...
            </p>

            {/* AI Analysis Preview */}
            {savedJob.match_analysis?.analysis && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Analysis</h4>
                  <button
                    onClick={() => {
                      setSelectedJob(savedJob)
                      setShowAnalysisModal(true)
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
                <p className="text-blue-700 dark:text-blue-200 text-sm">
                  {savedJob.match_analysis.analysis.overall_assessment?.substring(0, 150)}...
                </p>
              </div>
            )}

            {/* Personal Notes */}
            <div className="mb-4">
              {editingNotes === savedJob.job_id ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this job..."
                    className="w-full px-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNotes(savedJob.job_id, notes)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotes(null)
                        setNotes('')
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {savedJob.notes ? (
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Notes</h4>
                        <button
                          onClick={() => {
                            setEditingNotes(savedJob.job_id)
                            setNotes(savedJob.notes || '')
                          }}
                          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">{savedJob.notes}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNotes(savedJob.job_id)
                        setNotes('')
                      }}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors text-sm"
                    >
                      <Edit3 size={14} />
                      Add notes
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 ml-4">
            <a
              href={job.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              title="View Job"
            >
              <ExternalLink size={18} />
            </a>
            
            {!isApplied ? (
              <button
                onClick={() => markAsApplied(savedJob)}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-colors border ${
                  isProcessing 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-300 dark:border-slate-600'
                    : 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-950/70 border-green-200 dark:border-green-800'
                }`}
                title="Mark as Applied"
              >
                {isProcessing ? <RotateCcw size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            ) : (
              <button
                onClick={() => moveBackToSaved(savedJob)}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-colors border ${
                  isProcessing 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-300 dark:border-slate-600'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/70 border-amber-200 dark:border-amber-800'
                }`}
                title="Move back to Saved"
              >
                {isProcessing ? <RotateCcw size={18} className="animate-spin" /> : <Bookmark size={18} />}
              </button>
            )}
            
            <button
              onClick={() => removeJob(savedJob.job_id, isApplied ? 'applied' : 'saved')}
              disabled={isProcessing}
              className={`p-2 rounded-lg transition-colors border ${
                isProcessing 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-300 dark:border-slate-600'
                  : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-950/70 border-red-200 dark:border-red-800'
              }`}
              title="Remove"
            >
              {isProcessing ? <RotateCcw size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <PageLayout>
        <LoadingSkeleton variant="default" />
      </PageLayout>
    )
  }

  if (!user) return null

  const currentJobs = activeTab === 'saved' ? savedJobs : appliedJobs

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Job Applications
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage your saved opportunities and track your applications
            </p>
          </div>
          <button
            onClick={() => loadJobData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Saved Jobs</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.saved_jobs}</p>
                </div>
                <Bookmark className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Applied</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.applied_jobs}</p>
                </div>
                <Send className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Viewed</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.viewed_jobs}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {stats.viewed_jobs > 0 ? Math.round((stats.applied_jobs / stats.viewed_jobs) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
          <div className="border-b border-slate-200 dark:border-slate-800">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Bookmark size={16} />
                Saved Jobs ({savedJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`py-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'applied'
                    ? 'border-green-500 text-green-600 dark:text-green-500'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Send size={16} />
                Applied Jobs ({appliedJobs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Job Lists */}
        {currentJobs.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            {activeTab === 'saved' ? (
              <>
                <Bookmark className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No saved jobs yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start exploring jobs and save the ones that interest you to keep track of opportunities.
                </p>
                <button
                  onClick={() => router.push('/jobs')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  Explore Jobs
                </button>
              </>
            ) : (
              <>
                <Send className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No applications yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  When you apply to jobs, they&apos;ll appear here so you can track your progress.
                </p>
                <button
                  onClick={() => setActiveTab('saved')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                >
                  View Saved Jobs
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {currentJobs.map((job) => renderJobCard(job, activeTab === 'applied'))}
          </div>
        )}

        {/* AI Analysis Modal - Keep existing modal code */}
        {showAnalysisModal && selectedJob && selectedJob.match_analysis?.analysis && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      AI Job Analysis
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedJob.job_data.title} at {selectedJob.job_data.company?.display_name}
                    </p>
                    {selectedJob.ai_match_score && (
                      <div className="flex items-center gap-2 mt-2">
                        <Star size={16} className={getMatchScoreColor(selectedJob.ai_match_score)} />
                        <span className={`font-medium ${getMatchScoreColor(selectedJob.ai_match_score)}`}>
                          {selectedJob.ai_match_score}% Match Score
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Overall Assessment */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText size={18} />
                      Overall Assessment
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedJob.match_analysis.analysis.overall_assessment}
                    </p>
                  </div>

                  {/* Strengths */}
                  {selectedJob.match_analysis.analysis.strengths && (
                    <div>
                      <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {selectedJob.match_analysis.analysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                            <span className="text-slate-700 dark:text-slate-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concerns */}
                  {selectedJob.match_analysis.analysis.concerns && selectedJob.match_analysis.analysis.concerns.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Considerations
                      </h4>
                      <ul className="space-y-2">
                        {selectedJob.match_analysis.analysis.concerns.map((concern: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-500 mt-1">•</span>
                            <span className="text-slate-700 dark:text-slate-300">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <a
                    href={selectedJob.job_data.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                  >
                    View Job
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}