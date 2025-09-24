// src/pages/saved-jobs.tsx
// Manage saved jobs with AI analysis and application tracking

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import { 
  Bookmark, ExternalLink, Trash2, Star, Building, MapPin,
  DollarSign, Clock, Eye, Send, Edit3, FileText,
  ChevronRight, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react'

interface SavedJob {
  id: string
  job_id: string
  job_data: any
  interaction_type: string
  ai_match_score?: number
  match_analysis?: any
  notes?: string
  created_at: string
  updated_at: string
}

interface JobStats {
  total_interactions: number
  saved_jobs: number
  applied_jobs: number
  viewed_jobs: number
}

export default function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadSavedJobs()
    }
  }, [user])

  const loadSavedJobs = async () => {
    setLoading(true)
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
          interaction_type: 'saved',
          include_ai_analysis: true,
          limit: 50
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load saved jobs')
      }

      const data = await response.json()
      setSavedJobs(data.interactions || [])
      setStats(data.summary)
    } catch (error) {
      console.error('Error loading saved jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeJob = async (jobId: string) => {
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
          interaction_type: 'saved'
        })
      })

      if (response.ok) {
        setSavedJobs(prev => prev.filter(job => job.job_id !== jobId))
        if (stats) {
          setStats(prev => prev ? { ...prev, saved_jobs: prev.saved_jobs - 1 } : null)
        }
      }
    } catch (error) {
      console.error('Error removing job:', error)
    }
  }

  const markAsApplied = async (job: SavedJob) => {
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
        // Update local state or show success message
        console.log('Marked as applied')
      }
    } catch (error) {
      console.error('Error marking as applied:', error)
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
        setSavedJobs(prev => 
          prev.map(job => 
            job.job_id === jobId ? { ...job, notes: newNotes } : job
          )
        )
        setEditingNotes(null)
      }
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Saved today'
    if (diffDays === 1) return 'Saved yesterday'
    return `Saved ${diffDays} days ago`
  }

  if (authLoading || loading) {
    return (
      <PageLayout>
        <LoadingSkeleton variant="default" />
      </PageLayout>
    )
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Saved Jobs
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your saved opportunities and track your applications
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Saved Jobs</p>
                  <p className="text-2xl font-bold text-white">{stats.saved_jobs}</p>
                </div>
                <Bookmark className="h-8 w-8 text-violet-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Applied</p>
                  <p className="text-2xl font-bold text-white">{stats.applied_jobs}</p>
                </div>
                <Send className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Viewed</p>
                  <p className="text-2xl font-bold text-white">{stats.viewed_jobs}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.viewed_jobs > 0 ? Math.round((stats.applied_jobs / stats.viewed_jobs) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

        {/* Saved Jobs List */}
        {savedJobs.length === 0 ? (
          <div>
            <EmptyState
              icon={<Bookmark className="h-8 w-8" />}
              title="No saved jobs yet"
              description="Start exploring jobs and save the ones that interest you to keep track of opportunities."
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/jobs')}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg font-medium hover:from-violet-600 hover:to-indigo-600 transition-all text-white"
              >
                Explore Jobs
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((savedJob) => {
              const job = savedJob.job_data
              return (
                <div
                  key={savedJob.id}
                  className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-violet-500/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {job.title}
                        </h3>
                        {savedJob.ai_match_score && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded-lg">
                            <Star size={14} className={getMatchScoreColor(savedJob.ai_match_score)} />
                            <span className={`text-sm font-medium ${getMatchScoreColor(savedJob.ai_match_score)}`}>
                              {savedJob.ai_match_score}% match
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-slate-300 mb-3">
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
                        <div className="flex items-center gap-1 text-violet-400">
                          <Clock size={16} />
                          {formatTimeAgo(savedJob.created_at)}
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {job.description?.substring(0, 200)}...
                      </p>

                      {/* AI Analysis Preview */}
                      {savedJob.match_analysis?.analysis && (
                        <div className="mb-4 p-3 bg-violet-900/20 rounded-lg border border-violet-800/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-violet-300">AI Analysis</h4>
                            <button
                              onClick={() => {
                                setSelectedJob(savedJob)
                                setShowAnalysisModal(true)
                              }}
                              className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
                            >
                              View Details <ChevronRight size={14} />
                            </button>
                          </div>
                          <p className="text-violet-100 text-sm">
                            {savedJob.match_analysis.analysis.overall_assessment?.substring(0, 150)}...
                          </p>
                        </div>
                      )}

                      {/* Personal Notes */}
                      <div className="mb-4">
                        {editingNotes === savedJob.job_id ? (
                          <div className="space-y-2">
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add your notes about this job..."
                              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateNotes(savedJob.job_id, notes)}
                                className="px-3 py-1 bg-violet-500 text-white rounded hover:bg-violet-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingNotes(null)
                                  setNotes('')
                                }}
                                className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {savedJob.notes ? (
                              <div className="p-3 bg-slate-700/30 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-sm font-medium text-slate-300">Your Notes</h4>
                                  <button
                                    onClick={() => {
                                      setEditingNotes(savedJob.job_id)
                                      setNotes(savedJob.notes || '')
                                    }}
                                    className="text-slate-400 hover:text-white"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                </div>
                                <p className="text-slate-400 text-sm">{savedJob.notes}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingNotes(savedJob.job_id)
                                  setNotes('')
                                }}
                                className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors text-sm"
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
                        className="p-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all text-white"
                        title="View Job"
                      >
                        <ExternalLink size={18} />
                      </a>
                      
                      <button
                        onClick={() => markAsApplied(savedJob)}
                        className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                        title="Mark as Applied"
                      >
                        <Send size={18} />
                      </button>
                      
                      <button
                        onClick={() => removeJob(savedJob.job_id)}
                        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                        title="Remove from Saved"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* AI Analysis Modal */}
        {showAnalysisModal && selectedJob && selectedJob.match_analysis?.analysis && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      AI Job Analysis
                    </h3>
                    <p className="text-slate-300">
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
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Overall Assessment */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText size={18} />
                      Overall Assessment
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedJob.match_analysis.analysis.overall_assessment}
                    </p>
                  </div>

                  {/* Strengths */}
                  {selectedJob.match_analysis.analysis.strengths && (
                    <div>
                      <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {selectedJob.match_analysis.analysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span className="text-slate-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concerns */}
                  {selectedJob.match_analysis.analysis.concerns && selectedJob.match_analysis.analysis.concerns.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} />
                        Considerations
                      </h4>
                      <ul className="space-y-2">
                        {selectedJob.match_analysis.analysis.concerns.map((concern: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span className="text-slate-300">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  {selectedJob.match_analysis.analysis.recommendation && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-3">
                        Recommendation
                      </h4>
                      <div className={`p-3 rounded-lg border ${
                        selectedJob.match_analysis.analysis.recommendation === 'apply_now' 
                          ? 'bg-green-900/20 border-green-800/30 text-green-300'
                          : selectedJob.match_analysis.analysis.recommendation === 'save_for_later'
                          ? 'bg-yellow-900/20 border-yellow-800/30 text-yellow-300'
                          : 'bg-blue-900/20 border-blue-800/30 text-blue-300'
                      }`}>
                        <span className="font-medium">
                          {selectedJob.match_analysis.analysis.recommendation === 'apply_now' && 'Apply Now'}
                          {selectedJob.match_analysis.analysis.recommendation === 'save_for_later' && 'Save for Later'}
                          {selectedJob.match_analysis.analysis.recommendation === 'needs_more_research' && 'Needs More Research'}
                          {selectedJob.match_analysis.analysis.recommendation === 'not_suitable' && 'Not Suitable'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {selectedJob.match_analysis.analysis.next_steps && selectedJob.match_analysis.analysis.next_steps.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-3">
                        Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {selectedJob.match_analysis.analysis.next_steps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-violet-400 mt-1">•</span>
                            <span className="text-slate-300">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href={selectedJob.job_data.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all"
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