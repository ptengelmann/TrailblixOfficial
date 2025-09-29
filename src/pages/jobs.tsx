// src/pages/jobs.tsx
// Optimized job search interface - prevents wasteful API calls

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, memo } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { logger } from '@/lib/logger'
import {
  Search, Filter, MapPin, DollarSign, Clock,
  Bookmark, BookmarkCheck, ExternalLink,
  Briefcase, Building, Star,
  ChevronDown, ChevronUp, Sparkles,
  Globe, GitBranch
} from 'lucide-react'
// Define job sources directly since we removed the types file
type JobSource = 'adzuna' | 'jsearch' | 'reed' | 'github' | 'remoteok'

interface JobSearchFilters {
  query: string
  location: string
  salary_min: number
  salary_max: number
  remote: boolean
  employment_type: string
  experience_level: string
  sources: JobSource[]
}

interface Job {
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
  salary_min?: number
  salary_max?: number
  salary_formatted?: string
  contract_type?: string
  category: {
    label: string
  }
  created: string
  redirect_url: string
  ai_match_score?: number
  match_reasons?: string[]
  location_type?: 'remote' | 'hybrid' | 'onsite'
  is_saved?: boolean
  is_viewed?: boolean
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

interface JobCardProps {
  job: Job
  onJobInteraction: (job: Job, interactionType: 'viewed' | 'saved' | 'applied' | 'dismissed') => void
  getMatchScoreColor: (score?: number) => string
  formatTimeAgo: (dateString: string) => string
}

const JobCard = memo<JobCardProps>(({ job, onJobInteraction, getMatchScoreColor, formatTimeAgo }) => {
  // Source badge component
  const getSourceBadge = (source?: JobSource) => {
    const badges: Record<JobSource, { name: string; color: string }> = {
      adzuna: { name: 'Adzuna', color: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
      jsearch: { name: 'JSearch', color: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
      reed: { name: 'Reed', color: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
      github: { name: 'GitHub', color: 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
      remoteok: { name: 'RemoteOK', color: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' }
    }
    const badge = source ? badges[source] : null
    return badge ? (
      <span className={`px-2 py-1 text-xs rounded border ${badge.color}`}>
        {badge.name}
      </span>
    ) : null
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
              {job.title}
            </h3>
            {(job.ai_match_score || job.ai_insights?.match_score) && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Star size={14} className={getMatchScoreColor(job.ai_match_score || job.ai_insights?.match_score)} />
                <span className={`text-sm font-medium ${getMatchScoreColor(job.ai_match_score || job.ai_insights?.match_score)}`}>
                  {job.ai_match_score || job.ai_insights?.match_score}% match
                </span>
              </div>
            )}
            {job.location_type === 'remote' && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs rounded-lg border border-green-200 dark:border-green-800">
                Remote
              </span>
            )}
            {getSourceBadge(job.source)}
          </div>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-1">
              <Building size={16} />
              {job.company.display_name}
              {job.company_insights?.rating && (
                <div className="flex items-center gap-1 ml-2">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  <span className="text-sm">{job.company_insights.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              {job.location.display_name}
            </div>
            {job.salary_formatted && (
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                {job.salary_formatted}
                {job.salary_benchmarks?.market_position && (
                  <span className={`text-xs px-1 py-0.5 rounded ${
                    job.salary_benchmarks.market_position === 'above' ? 'text-green-600 bg-green-50' :
                    job.salary_benchmarks.market_position === 'below' ? 'text-red-600 bg-red-50' :
                    'text-slate-600 bg-slate-50'
                  }`}>
                    {job.salary_benchmarks.market_position}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock size={16} />
              {formatTimeAgo(job.created)}
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
            {job.description.substring(0, 300)}...
          </p>

          {(job.match_reasons || job.ai_insights?.match_reasoning) && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-500 mb-2">Why this matches:</h4>
              <div className="flex flex-wrap gap-2">
                {(job.match_reasons || job.ai_insights?.match_reasoning || []).map((reason, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs rounded border border-blue-200 dark:border-blue-800"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">{job.category.label}</span>
            <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">{job.contract_type || 'Full-time'}</span>
            {job.ai_insights?.career_growth_potential && (
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded">
                {job.ai_insights.career_growth_potential} Growth
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={() => onJobInteraction(job, 'saved')}
            className={`p-2 rounded-lg transition-colors ${
              job.is_saved
                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-500 border border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {job.is_saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>

          <a
            href={job.redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onJobInteraction(job, 'viewed')}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all text-white"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  )
})

JobCard.displayName = 'JobCard'

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    total_results: number
    search_metadata?: {
      query?: string
      ai_matching_enabled?: boolean
      source_breakdown?: Record<string, number>
    }
  } | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
  const [filters, setFilters] = useState<JobSearchFilters>({
    query: '',
    location: '',
    salary_min: 0,
    salary_max: 200000,
    remote: false,
    employment_type: '',
    experience_level: '',
    sources: ['adzuna', 'jsearch', 'reed', 'github']
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Load user preferences ONCE when component mounts
  useEffect(() => {
    if (user && !hasSearched) {
      loadUserPreferences()
    }

    // Cleanup abort controller on unmount
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [user, abortController, hasSearched])

  const loadUserPreferences = async () => {
    try {
      const { data } = await supabase
        .from('career_objectives')
        .select('target_role, target_industry, work_preference, job_preferences')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setFilters(prev => ({
          ...prev,
          query: data.target_role || prev.query,
          remote: data.work_preference === 'remote',
          salary_min: (data.job_preferences as { salary_min?: number; salary_max?: number } | null)?.salary_min || prev.salary_min,
          salary_max: (data.job_preferences as { salary_min?: number; salary_max?: number } | null)?.salary_max || prev.salary_max,
          sources: prev.sources
        }))

        logger.info('User preferences loaded, ready to search', 'USER_ACTION', { targetRole: data.target_role, workPreference: data.work_preference })
      }
    } catch (error) {
      logger.error('Failed to load user preferences', 'DATABASE', { error: error.message })
    }
  }

  const performSearch = useCallback(async (searchFilters = filters) => {
    if (loading) return

    // Cancel previous search if still running
    if (abortController) {
      abortController.abort()
    }

    const newAbortController = new AbortController()
    setAbortController(newAbortController)
    setLoading(true)
    setHasSearched(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const requestFilters = {
        query: searchFilters.query.trim(),
        location: searchFilters.location.trim(),
        salary_min: searchFilters.salary_min > 0 ? searchFilters.salary_min : undefined,
        salary_max: searchFilters.salary_max < 200000 ? searchFilters.salary_max : undefined,
        employment_type: searchFilters.employment_type || undefined,
        per_page: 20
      }

      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          filters: requestFilters,
          generate_ai_matching: true,
          save_search_session: true
        }),
        signal: newAbortController.signal
      })

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`)
      }

      const data = await response.json()

      // Only update state if this request wasn't aborted
      if (!newAbortController.signal.aborted) {
        logger.debug('Job search completed successfully', 'SEARCH', { totalResults: data.total_results, jobCount: data.jobs?.length || 0 })
        setJobs(data.jobs || [])
        setSearchResults({
          total_results: data.total_results || 0,
          search_metadata: data.search_metadata
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.debug('Job search aborted by user', 'SEARCH')
      } else {
        logger.error('Job search failed', 'SEARCH', { error: error.message, filters: requestFilters })
        // Show user-friendly error
        alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      if (!newAbortController.signal.aborted) {
        setLoading(false)
        setAbortController(null)
      }
    }
  }, [filters, loading, abortController])

  const handleJobInteraction = useCallback(async (job: Job, interactionType: 'viewed' | 'saved' | 'applied' | 'dismissed') => {
    logger.info(`Job interaction: ${interactionType}`, 'USER_ACTION', { jobId: job.id, interactionType, jobTitle: job.title })

    // Prevent duplicate saves
    if (interactionType === 'saved' && job.is_saved) return

    const optimisticUpdate = (shouldUpdate: boolean) => {
      setJobs(prevJobs =>
        prevJobs.map(j =>
          j.id === job.id
            ? {
                ...j,
                is_saved: interactionType === 'saved' ? shouldUpdate : j.is_saved,
                is_viewed: interactionType === 'viewed' ? shouldUpdate : j.is_viewed
              }
            : j
        )
      )
    }

    // Optimistically update UI immediately
    optimisticUpdate(true)

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
          job_id: job.id,
          job_data: {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description.substring(0, 1000) // Limit description size
          },
          interaction_type: interactionType,
          generate_ai_analysis: interactionType === 'saved'
        })
      })

      if (!response.ok) {
        optimisticUpdate(false)
        logger.error('Failed to save job interaction', 'API', { jobId: job.id, interactionType })
      }
    } catch (error) {
      logger.error('Job interaction failed', 'API', { jobId: job.id, interactionType, error: error.message })
      optimisticUpdate(false)
    }
  }, [])

  const getMatchScoreColor = useCallback((score?: number) => {
    if (!score) return 'text-slate-500 dark:text-slate-400'
    if (score >= 80) return 'text-green-600 dark:text-green-500'
    if (score >= 60) return 'text-amber-600 dark:text-amber-500'
    return 'text-red-600 dark:text-red-500'
  }, [])

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }, [])

  if (authLoading) {
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
          <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">
            Job Search
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            AI-powered job matching based on your career goals
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs (e.g., Software Engineer, Product Manager)"
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => performSearch()}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all disabled:opacity-50 text-white min-w-[100px]"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            <Filter size={16} />
            Advanced Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Job Sources Selection */}
              <div>
                <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Job Sources</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'adzuna', name: 'Adzuna', icon: Globe },
                    { id: 'jsearch', name: 'JSearch', icon: Search },
                    { id: 'reed', name: 'Reed', icon: Briefcase },
                    { id: 'github', name: 'GitHub Jobs', icon: GitBranch }
                  ].map((source) => {
                    const IconComponent = source.icon
                    return (
                      <label key={source.id} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.sources.includes(source.id as JobSource)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, sources: [...prev.sources, source.id as JobSource] }))
                            } else {
                              setFilters(prev => ({ ...prev, sources: prev.sources.filter(s => s !== source.id) }))
                            }
                          }}
                          className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        <IconComponent size={16} className="text-slate-600 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{source.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Employment Type</label>
                  <select
                    value={filters.employment_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, employment_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Salary Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.salary_min || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, salary_min: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.salary_max === 200000 ? '' : filters.salary_max}
                      onChange={(e) => setFilters(prev => ({ ...prev, salary_max: parseInt(e.target.value) || 200000 }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.remote}
                      onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.checked }))}
                      className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    Remote Jobs Only
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results Header */}
        {searchResults && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-600 dark:text-slate-400">
                Found {searchResults.total_results} jobs
                {searchResults.search_metadata?.query && (
                  <span> for &quot;{searchResults.search_metadata.query}&quot;</span>
                )}
              </div>
              {searchResults.search_metadata?.ai_matching_enabled && (
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-500 text-sm">
                  <Sparkles size={14} />
                  AI-powered matching enabled
                </div>
              )}
            </div>

            {/* Source breakdown */}
            {searchResults.search_metadata?.source_breakdown && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(searchResults.search_metadata.source_breakdown).map(([source, count]) => {
                  const badges: Record<string, { name: string; color: string }> = {
                    adzuna: { name: 'Adzuna', color: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400' },
                    jsearch: { name: 'JSearch', color: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400' },
                    reed: { name: 'Reed', color: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400' },
                    github: { name: 'GitHub', color: 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-400' },
                    remoteok: { name: 'RemoteOK', color: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400' }
                  }
                  const badge = badges[source]
                  const jobCount = typeof count === 'number' ? count : 0
                  return badge && jobCount > 0 ? (
                    <div key={source} className={`px-2 py-1 rounded-lg text-xs ${badge.color}`}>
                      {badge.name}: {jobCount}
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>
        )}

        {/* Job Results */}
        {loading ? (
          <LoadingSkeleton variant="default" />
        ) : !hasSearched ? (
          // Show empty state when user hasn&apos;t searched yet
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ready to find your next opportunity?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Enter your target role and location above, then click Search to discover AI-matched job opportunities.
            </p>
            {filters.query && (
              <button
                onClick={() => performSearch()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all text-white"
              >
                Search for &quot;{filters.query}&quot; jobs
              </button>
            )}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onJobInteraction={handleJobInteraction}
                getMatchScoreColor={getMatchScoreColor}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}