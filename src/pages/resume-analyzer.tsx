// src/pages/resume-analyzer.tsx - Resume Analyzer (Redesigned)
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { logger } from '@/lib/logger'
import {
  Upload, FileText, CheckCircle, AlertCircle, Lightbulb,
  TrendingUp, TrendingDown, Minus, Star, Target,
  BookOpen, Award, BarChart3, Users, Brain,
  Zap, ChevronRight, Trash2,
  Calendar, RefreshCw
} from 'lucide-react'

interface SkillsIntelligence {
  // Legacy compatibility - some analyses might have direct score
  score?: number
  
  extracted_skills?: {
    technical?: Array<{
      skill: string
      confidence: number
      category: string
      years_experience?: number
      proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    }>
    soft?: Array<{
      skill: string
      confidence: number
      evidence: string[]
    }>
    industry_specific?: Array<{
      skill: string
      confidence: number
      industry: string
    }>
    certifications?: Array<{
      name: string
      issuer: string
      year?: number
      status: 'active' | 'expired' | 'unknown'
    }>
  }
  skill_gaps?: {
    missing_for_target_role?: Array<{
      skill: string
      importance: 'critical' | 'important' | 'nice_to_have'
      market_demand: number
      learning_resources: string[]
    }>
    outdated_skills?: Array<{
      skill: string
      current_relevance: number
      modernization_path: string
    }>
  }
  market_intelligence?: {
    skills_demand_analysis?: Array<{
      skill: string
      demand_trend: 'rising' | 'stable' | 'declining'
      demand_score: number
      salary_impact: number
      job_market_growth: string
    }>
    competitive_positioning?: {
      percentile_ranking: number
      similar_profiles_comparison: string
      unique_differentiators: string[]
    }
  }
  career_progression?: {
    suggested_next_roles?: Array<{
      title: string
      skills_alignment: number
      skills_needed: string[]
      timeline_estimate: string
    }>
    skill_development_priorities?: Array<{
      skill: string
      priority_score: number
      learning_path: {
        beginner: string[]
        intermediate: string[]
        advanced: string[]
      }
      estimated_time_to_proficiency: string
    }>
  }
  overall_assessment?: {
    marketability_score: number
    strengths: string[]
    improvement_areas: string[]
    strategic_recommendations: string[]
  }
  
  // Legacy fields that might exist in old analyses
  strengths?: string[]
  improvements?: string[]
  recommendations?: string[]
}

interface ResumeRecord {
  id: string
  file_name: string
  file_url: string
  file_size: number
  score: number
  ai_analysis: SkillsIntelligence
  created_at: string
}

export default function EnhancedResumeAnalyzer() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SkillsIntelligence | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'skills' | 'gaps' | 'market' | 'career'>('skills')
  const [resumeHistory, setResumeHistory] = useState<ResumeRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadResumeHistory()
    }
  }, [user])

  const loadResumeHistory = async () => {
    try {
      setLoadingHistory(true)
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setResumeHistory(data)
        // Auto-load the most recent analysis if none is currently selected
        if (!analysis && !selectedResumeId) {
          loadAnalysis(data[0])
        }
      }
    } catch (error) {
      logger.error('Failed to load resume history', 'DATABASE', { userId: user?.id, error: error.message })
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadAnalysis = (resume: ResumeRecord) => {
    logger.info(`Loading analysis for resume: ${resume.file_name}`, 'USER_ACTION', { resumeId: resume.id, fileName: resume.file_name })
    setAnalysis(resume.ai_analysis)
    setSelectedResumeId(resume.id)
    setShowUpload(false)
  }

  const deleteResume = async (resumeId: string, fileName: string) => {
    if (!confirm('Are you sure you want to delete this resume analysis?')) return

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user?.id)

      if (dbError) throw dbError

      // Delete from storage
      const filePath = fileName.split('/').slice(-2).join('/')
      await supabase.storage.from('resumes').remove([filePath])

      // Update UI
      setResumeHistory(prev => prev.filter(r => r.id !== resumeId))
      if (selectedResumeId === resumeId) {
        setAnalysis(null)
        setSelectedResumeId(null)
      }
    } catch (error) {
      logger.error('Failed to delete resume', 'DATABASE', { resumeId, error: error.message })
      setError('Failed to delete resume')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.type.includes('document')) {
        setError('Please upload a PDF or Word document')
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/extract-pdf-text', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to extract PDF text')
      }
      
      const data = await response.json()
      return data.text
    } catch (error) {
      logger.error('PDF text extraction failed', 'API', { error: error.message, fileName: file.name })
      throw new Error('Could not extract text from PDF. Please ensure it\'s a valid PDF file.')
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (!file || !user) return

    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file)

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName)

      setUploading(false)
      setAnalyzing(true)

      const resumeText = await extractTextFromPDF(file)
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ resumeText })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const analysisData = await response.json()

      // Save to database
      const { data: savedResume, error: saveError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          ai_analysis: analysisData,
          score: analysisData.overall_assessment?.marketability_score || 0,
        })
        .select()
        .single()

      if (saveError) throw new Error(`Failed to save: ${saveError.message}`)

      // Update UI
      setAnalysis(analysisData)
      setFile(null)
      setShowUpload(false)
      await loadResumeHistory()
      setSelectedResumeId(savedResume.id)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-700 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-950/50 dark:border-purple-800'
      case 'advanced': return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800'
      case 'intermediate': return 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800'
      case 'beginner': return 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-950/50 dark:border-green-800'
      default: return 'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="text-green-600 dark:text-green-500" size={16} />
      case 'declining': return <TrendingDown className="text-red-600 dark:text-red-500" size={16} />
      default: return <Minus className="text-amber-600 dark:text-amber-500" size={16} />
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-950/50 dark:border-red-800'
      case 'important': return 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800'
      case 'nice_to_have': return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800'
      default: return 'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700'
    }
  }

  if (authLoading || loadingHistory) {
    return (
      <PageLayout>
        <LoadingSkeleton variant="default" />
      </PageLayout>
    )
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">
              Resume Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              AI-powered skills analysis and career optimization
            </p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Upload size={18} />
            {showUpload ? 'Hide Upload' : 'Analyze Resume'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Resume History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Resume History</h2>
                <button
                  onClick={loadResumeHistory}
                  className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {resumeHistory.length > 0 ? (
                <div className="space-y-3">
                  {resumeHistory.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedResumeId === resume.id
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
                          : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                      onClick={() => loadAnalysis(resume)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {resume.file_name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteResume(resume.id, resume.file_url)
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(resume.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target size={12} />
                          {resume.score}/100
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">No resumes yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Upload your first resume to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Upload Section */}
            {showUpload && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 mb-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                    Upload your resume for comprehensive analysis
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <FileText size={16} />
                      <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-600 dark:text-red-500" />
                      <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={!file || uploading || analyzing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>Uploading...</>
                  ) : analyzing ? (
                    <>
                      <Brain size={20} />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Analysis Display */}
            {analysis ? (
              <div className="space-y-8">
                {/* Overall Assessment */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                  <div className="text-center mb-6">
                    <div className="text-6xl font-light text-slate-900 dark:text-white mb-2">
                      {analysis.overall_assessment?.marketability_score || analysis.score || 'N/A'}/100
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Marketability Score</p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-600 dark:text-blue-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {analysis.market_intelligence?.competitive_positioning?.percentile_ranking || 'N/A'}th percentile
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="text-green-600 dark:text-green-500" size={20} />
                        <h3 className="font-semibold text-green-700 dark:text-green-400">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {(analysis.overall_assessment?.strengths || []).map((strength, i) => (
                          <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="text-amber-600 dark:text-amber-500" size={20} />
                        <h3 className="font-semibold text-amber-700 dark:text-amber-400">Growth Areas</h3>
                      </div>
                      <ul className="space-y-2">
                        {(analysis.overall_assessment?.improvement_areas || []).map((area, i) => (
                          <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-500 mt-1">•</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="text-blue-600 dark:text-blue-500" size={20} />
                        <h3 className="font-semibold text-blue-700 dark:text-blue-400">Unique Edge</h3>
                      </div>
                      <ul className="space-y-2">
                        {(analysis.market_intelligence?.competitive_positioning?.unique_differentiators || []).map((diff, i) => (
                          <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { key: 'skills', label: 'Skills Portfolio', icon: Award },
                        { key: 'gaps', label: 'Skill Gaps', icon: Target },
                        { key: 'market', label: 'Market Intelligence', icon: BarChart3 },
                        { key: 'career', label: 'Career Path', icon: TrendingUp }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key as 'skills' | 'gaps' | 'market' | 'career')}
                          className={`py-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                            activeTab === key
                              ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                          }`}
                        >
                          <Icon size={16} />
                          {label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* Skills Portfolio Tab */}
                    {activeTab === 'skills' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="text-blue-600 dark:text-blue-500" />
                            Technical Skills
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(analysis.extracted_skills?.technical || []).map((skill, i) => (
                              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-slate-900 dark:text-white">{skill.skill}</span>
                                  <span className={`text-xs px-2 py-1 rounded border font-medium ${getProficiencyColor(skill.proficiency_level)}`}>
                                    {skill.proficiency_level}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">{skill.category}</div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {skill.years_experience ? `${skill.years_experience}+ years` : 'Experience noted'}
                                  </span>
                                  <span className="text-green-600 dark:text-green-500 font-medium">{skill.confidence}% match</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="text-green-600 dark:text-green-500" />
                            Soft Skills
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(analysis.extracted_skills?.soft || []).map((skill, i) => (
                              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-slate-900 dark:text-white">{skill.skill}</span>
                                  <span className="text-blue-600 dark:text-blue-500 text-sm font-medium">{skill.confidence}%</span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  Evidence: {skill.evidence?.join(', ') || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {(analysis.extracted_skills?.certifications?.length || 0) > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <Award className="text-purple-600 dark:text-purple-500" />
                              Certifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(analysis.extracted_skills?.certifications || []).map((cert, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                  <div className="font-medium text-slate-900 dark:text-white">{cert.name}</div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">{cert.issuer}</div>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                      {cert.year || 'Year not specified'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded border font-medium ${
                                      cert.status === 'active' ? 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-950/50 dark:border-green-800' :
                                      cert.status === 'expired' ? 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-950/50 dark:border-red-800' :
                                      'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800'
                                    }`}>
                                      {cert.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skill Gaps Tab */}
                    {activeTab === 'gaps' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Target className="text-red-600 dark:text-red-500" />
                            Missing Skills for Target Role
                          </h3>
                          <div className="space-y-4">
                            {(analysis.skill_gaps?.missing_for_target_role || []).map((gap, i) => (
                              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-slate-900 dark:text-white">{gap.skill}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded border font-medium ${getImportanceColor(gap.importance)}`}>
                                      {gap.importance?.replace('_', ' ') || 'unknown'}
                                    </span>
                                    <span className="text-green-600 dark:text-green-500 text-sm font-medium">{gap.market_demand}% demand</span>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  <strong>Learning Resources:</strong> {gap.learning_resources?.join(', ') || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {(analysis.skill_gaps?.outdated_skills?.length || 0) > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <AlertCircle className="text-amber-600 dark:text-amber-500" />
                              Skills Needing Modernization
                            </h3>
                            <div className="space-y-4">
                              {(analysis.skill_gaps?.outdated_skills || []).map((outdated, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-slate-900 dark:text-white">{outdated.skill}</span>
                                    <span className="text-amber-600 dark:text-amber-500 text-sm font-medium">{outdated.current_relevance}% relevant</span>
                                  </div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <strong>Modernization Path:</strong> {outdated.modernization_path}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Market Intelligence Tab */}
                    {activeTab === 'market' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="text-blue-600 dark:text-blue-500" />
                            Skills Market Analysis
                          </h3>
                          <div className="space-y-4">
                            {(analysis.market_intelligence?.skills_demand_analysis || []).map((skill, i) => (
                              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-slate-900 dark:text-white">{skill.skill}</span>
                                    {getTrendIcon(skill.demand_trend)}
                                    <span className={`text-sm font-medium ${
                                      skill.demand_trend === 'rising' ? 'text-green-600 dark:text-green-500' :
                                      skill.demand_trend === 'declining' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'
                                    }`}>
                                      {skill.demand_trend}
                                    </span>
                                  </div>
                                  <span className="text-blue-600 dark:text-blue-500 text-sm font-medium">{skill.demand_score}/100</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                                  <div>
                                    <strong>Salary Impact:</strong> +{skill.salary_impact}%
                                  </div>
                                  <div>
                                    <strong>Market Growth:</strong> {skill.job_market_growth}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Competitive Positioning</h4>
                          <p className="text-slate-700 dark:text-slate-300">
                            {analysis.market_intelligence?.competitive_positioning?.similar_profiles_comparison || 'Analysis in progress...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Career Path Tab */}
                    {activeTab === 'career' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="text-green-600 dark:text-green-500" />
                            Suggested Career Progression
                          </h3>
                          <div className="space-y-4">
                            {(analysis.career_progression?.suggested_next_roles || []).map((role, i) => (
                              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-slate-900 dark:text-white text-lg">{role.title}</span>
                                  <span className="text-green-600 dark:text-green-500 text-sm font-medium">{role.skills_alignment}% alignment</span>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                  <strong>Timeline:</strong> {role.timeline_estimate}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  <strong>Skills to Develop:</strong> {role.skills_needed?.join(', ') || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="text-purple-600 dark:text-purple-500" />
                            Priority Learning Path
                          </h3>
                          <div className="space-y-4">
                            {(analysis.career_progression?.skill_development_priorities || []).slice(0, 3).map((priority, i) => (
                              <div key={i} className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-6 border border-violet-200 dark:border-violet-800">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="font-medium text-slate-900 dark:text-white text-lg">{priority.skill}</span>
                                  <div className="flex items-center gap-2">
                                    <Star className="text-amber-600 dark:text-amber-500" size={16} />
                                    <span className="text-amber-600 dark:text-amber-500 text-sm font-medium">{priority.priority_score}/100</span>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                  <strong>Time to Proficiency:</strong> {priority.estimated_time_to_proficiency}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h5 className="text-green-700 dark:text-green-400 font-medium mb-2">Beginner</h5>
                                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                      {(priority.learning_path?.beginner || []).map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <ChevronRight size={12} className="text-green-600 dark:text-green-500 mt-0.5" />
                                          {step}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="text-amber-700 dark:text-amber-400 font-medium mb-2">Intermediate</h5>
                                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                      {(priority.learning_path?.intermediate || []).map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <ChevronRight size={12} className="text-amber-600 dark:text-amber-500 mt-0.5" />
                                          {step}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="text-purple-700 dark:text-purple-400 font-medium mb-2">Advanced</h5>
                                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                      {(priority.learning_path?.advanced || []).map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <ChevronRight size={12} className="text-purple-600 dark:text-purple-500 mt-0.5" />
                                          {step}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Strategic Recommendations</h4>
                          <ul className="space-y-2">
                            {(analysis.overall_assessment?.strategic_recommendations || []).map((rec, i) => (
                              <li key={i} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <Lightbulb className="text-amber-600 dark:text-amber-500 mt-0.5" size={16} />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
                <Brain className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Select a Resume Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose a resume from your history or upload a new one to view comprehensive skills intelligence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}