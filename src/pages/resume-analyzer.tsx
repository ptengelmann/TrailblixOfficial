// Enhanced resume-analyzer.tsx with resume history and analysis management

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import { 
  Upload, FileText, CheckCircle, AlertCircle, Lightbulb, 
  TrendingUp, TrendingDown, Minus, Star, Target, 
  BookOpen, Clock, Award, BarChart3, Users, Brain,
  Zap, ArrowUp, ArrowDown, ChevronRight, Trash2, 
  Calendar, Download, Eye, RefreshCw
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
      console.error('Error loading resume history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadAnalysis = (resume: ResumeRecord) => {
    console.log('Loading analysis for resume:', resume.file_name)
    console.log('Analysis structure:', {
      has_overall_assessment: !!resume.ai_analysis?.overall_assessment,
      has_extracted_skills: !!resume.ai_analysis?.extracted_skills,
      has_skill_gaps: !!resume.ai_analysis?.skill_gaps,
      has_market_intelligence: !!resume.ai_analysis?.market_intelligence,
      has_career_progression: !!resume.ai_analysis?.career_progression,
      direct_score: resume.ai_analysis?.score,
      nested_score: resume.ai_analysis?.overall_assessment?.marketability_score
    })
    
    setAnalysis(resume.ai_analysis)
    setSelectedResumeId(resume.id)
    setShowUpload(false) // Hide upload form when viewing analysis
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
      const filePath = fileName.split('/').slice(-2).join('/') // Extract user_id/filename
      await supabase.storage.from('resumes').remove([filePath])

      // Update UI
      setResumeHistory(prev => prev.filter(r => r.id !== resumeId))
      if (selectedResumeId === resumeId) {
        setAnalysis(null)
        setSelectedResumeId(null)
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      setError('Failed to delete resume')
    }
  }

  // Your existing functions (handleFileChange, extractTextFromPDF, handleUploadAndAnalyze, etc.)
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
      console.error('PDF extraction error:', error)
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
      await loadResumeHistory() // Refresh the history
      setSelectedResumeId(savedResume.id)

    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  // Your existing utility functions remain the same
  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-400 bg-purple-900/30 border-purple-800/30'
      case 'advanced': return 'text-blue-400 bg-blue-900/30 border-blue-800/30'
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800/30'
      case 'beginner': return 'text-green-400 bg-green-900/30 border-green-800/30'
      default: return 'text-gray-400 bg-gray-900/30 border-gray-800/30'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="text-green-400" size={16} />
      case 'declining': return <TrendingDown className="text-red-400" size={16} />
      default: return <Minus className="text-yellow-400" size={16} />
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-800/30'
      case 'important': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800/30'
      case 'nice_to_have': return 'text-blue-400 bg-blue-900/30 border-blue-800/30'
      default: return 'text-gray-400 bg-gray-900/30 border-gray-800/30'
    }
  }

  if (authLoading || loadingHistory) {
    return (
      <PageLayout>
        <LoadingSkeleton variant="resume" />
      </PageLayout>
    )
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Skills Intelligence Engine
          </h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all flex items-center gap-2 text-white"
          >
            <Upload size={18} />
            {showUpload ? 'Hide Upload' : 'Analyze New Resume'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Resume History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Resume History</h2>
                <button
                  onClick={loadResumeHistory}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {resumeHistory.length > 0 ? (
                <div className="space-y-3">
                  {resumeHistory.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedResumeId === resume.id
                          ? 'bg-violet-500/20 border-violet-500/50'
                          : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-600/30'
                      }`}
                      onClick={() => loadAnalysis(resume)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white truncate">
                          {resume.file_name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteResume(resume.id, resume.file_url)
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400">
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
                <EmptyState
                  icon={<FileText className="h-6 w-6" />}
                  title="No Resumes Yet"
                  description="Upload your first resume to get started with AI-powered skills analysis."
                />
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Upload Section - Only show when requested */}
            {showUpload && (
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-white">
                    Upload your resume for comprehensive skills analysis
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-violet-500 file:text-white hover:file:bg-violet-600"
                    />
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                      <FileText size={16} />
                      <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-red-400 mb-4 flex items-center gap-2 bg-red-900/20 p-3 rounded-lg border border-red-800/30">
                    <AlertCircle size={16} />
                    {error}
                  </p>
                )}

                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={!file || uploading || analyzing}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg font-medium hover:from-violet-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white"
                >
                  {uploading ? (
                    <>Uploading to secure storage...</>
                  ) : analyzing ? (
                    <>Analyzing with Advanced AI...</>
                  ) : (
                    <>
                      <Brain size={20} />
                      Analyze Skills
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Analysis Display - Complete with all functionality */}
            {analysis ? (
              <div className="space-y-8">
                {/* Overall Assessment */}
                <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-8 border border-violet-500/20">
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                      {analysis.overall_assessment?.marketability_score || analysis.score || 'N/A'}/100
                    </div>
                    <p className="text-slate-400 text-lg">Marketability Score</p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-violet-400" />
                        <span className="text-sm text-slate-300">
                          {analysis.market_intelligence?.competitive_positioning?.percentile_ranking || 'N/A'}th percentile
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="text-green-400" size={20} />
                        <h3 className="font-bold text-green-400">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {(analysis.overall_assessment?.strengths || []).map((strength, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="text-yellow-400" size={20} />
                        <h3 className="font-bold text-yellow-400">Growth Areas</h3>
                      </div>
                      <ul className="space-y-2">
                        {(analysis.overall_assessment?.improvement_areas || []).map((area, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="text-violet-400" size={20} />
                        <h3 className="font-bold text-violet-400">Unique Edge</h3>
                      </div>
                      <ul className="space-y-2">
                        {(analysis.market_intelligence?.competitive_positioning?.unique_differentiators || []).map((diff, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-violet-400 mt-1">•</span>
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                  <div className="border-b border-slate-700/50">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { key: 'skills', label: 'Skills Portfolio', icon: Award },
                        { key: 'gaps', label: 'Skill Gaps', icon: Target },
                        { key: 'market', label: 'Market Intelligence', icon: BarChart3 },
                        { key: 'career', label: 'Career Path', icon: TrendingUp }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key as any)}
                          className={`py-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                            activeTab === key
                              ? 'border-violet-500 text-violet-400'
                              : 'border-transparent text-slate-400 hover:text-slate-300'
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
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="text-violet-400" />
                            Technical Skills
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(analysis.extracted_skills?.technical || []).map((skill, i) => (
                              <div key={i} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-white">{skill.skill}</span>
                                  <span className={`text-xs px-2 py-1 rounded border ${getProficiencyColor(skill.proficiency_level)}`}>
                                    {skill.proficiency_level}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 mb-2">{skill.category}</div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400">
                                    {skill.years_experience ? `${skill.years_experience}+ years` : 'Experience noted'}
                                  </span>
                                  <span className="text-green-400">{skill.confidence}% match</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="text-blue-400" />
                            Soft Skills
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(analysis.extracted_skills?.soft || []).map((skill, i) => (
                              <div key={i} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-white">{skill.skill}</span>
                                  <span className="text-blue-400 text-sm">{skill.confidence}%</span>
                                </div>
                                <div className="text-xs text-slate-400">
                                  Evidence: {skill.evidence?.join(', ') || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {(analysis.extracted_skills?.certifications?.length || 0) > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Award className="text-green-400" />
                              Certifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(analysis.extracted_skills?.certifications || []).map((cert, i) => (
                                <div key={i} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                                  <div className="font-medium text-white">{cert.name}</div>
                                  <div className="text-sm text-slate-400">{cert.issuer}</div>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-slate-400">
                                      {cert.year || 'Year not specified'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      cert.status === 'active' ? 'text-green-400 bg-green-900/30' :
                                      cert.status === 'expired' ? 'text-red-400 bg-red-900/30' :
                                      'text-yellow-400 bg-yellow-900/30'
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
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="text-red-400" />
                            Missing Skills for Target Role
                          </h3>
                          <div className="space-y-4">
                            {(analysis.skill_gaps?.missing_for_target_role || []).map((gap, i) => (
                              <div key={i} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-white">{gap.skill}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded border ${getImportanceColor(gap.importance)}`}>
                                      {gap.importance?.replace('_', ' ') || 'unknown'}
                                    </span>
                                    <span className="text-green-400 text-sm">{gap.market_demand}% demand</span>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-400 mb-2">
                                  <strong>Learning Resources:</strong> {gap.learning_resources?.join(', ') || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {(analysis.skill_gaps?.outdated_skills?.length || 0) > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <AlertCircle className="text-yellow-400" />
                              Skills Needing Modernization
                            </h3>
                            <div className="space-y-4">
                              {(analysis.skill_gaps?.outdated_skills || []).map((outdated, i) => (
                                <div key={i} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-white">{outdated.skill}</span>
                                    <span className="text-yellow-400 text-sm">{outdated.current_relevance}% relevant</span>
                                  </div>
                                  <div className="text-sm text-slate-400">
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
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="text-blue-400" />
                            Skills Market Analysis
                          </h3>
                          <div className="space-y-4">
                            {(analysis.market_intelligence?.skills_demand_analysis || []).map((skill, i) => (
                              <div key={i} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-white">{skill.skill}</span>
                                    {getTrendIcon(skill.demand_trend)}
                                    <span className={`text-sm ${
                                      skill.demand_trend === 'rising' ? 'text-green-400' :
                                      skill.demand_trend === 'declining' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                      {skill.demand_trend}
                                    </span>
                                  </div>
                                  <span className="text-violet-400 text-sm">{skill.demand_score}/100</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
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

                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
                          <h4 className="font-bold text-white mb-2">Competitive Positioning</h4>
                          <p className="text-slate-300 mb-4">
                            {analysis.market_intelligence?.competitive_positioning?.similar_profiles_comparison || 'Analysis in progress...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Career Path Tab */}
                    {activeTab === 'career' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="text-green-400" />
                            Suggested Career Progression
                          </h3>
                          <div className="space-y-4">
                            {(analysis.career_progression?.suggested_next_roles || []).map((role, i) => (
                              <div key={i} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-white text-lg">{role.title}</span>
                                  <span className="text-green-400 text-sm">{role.skills_alignment}% alignment</span>
                                </div>
                                <div className="text-sm text-slate-400 mb-2">
                                  <strong>Timeline:</strong> {role.timeline_estimate}
                                </div>
                                <div className="text-sm text-slate-400">
                                  <strong>Skills to Develop:</strong> {role.skills_needed?.join(', ') || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BookOpen className="text-violet-400" />
                            Priority Learning Path
                          </h3>
                          <div className="space-y-4">
                            {(analysis.career_progression?.skill_development_priorities || []).slice(0, 3).map((priority, i) => (
                              <div key={i} className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-lg p-6 border border-violet-500/20">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="font-medium text-white text-lg">{priority.skill}</span>
                                  <div className="flex items-center gap-2">
                                    <Star className="text-yellow-400" size={16} />
                                    <span className="text-yellow-400 text-sm">{priority.priority_score}/100</span>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-400 mb-4">
                                  <strong>Time to Proficiency:</strong> {priority.estimated_time_to_proficiency}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h5 className="text-green-400 font-medium mb-2">Beginner</h5>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                      {(priority.learning_path?.beginner || []).map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <ChevronRight size={12} className="text-green-400 mt-0.5" />
                                          {step}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="text-yellow-400 font-medium mb-2">Intermediate</h5>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                      {(priority.learning_path?.intermediate || []).map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <ChevronRight size={12} className="text-yellow-400 mt-0.5" />
                                          {step}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="text-purple-400 font-medium mb-2">Advanced</h5>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                      {(priority.learning_path?.advanced || []).map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <ChevronRight size={12} className="text-purple-400 mt-0.5" />
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

                        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
                          <h4 className="font-bold text-white mb-2">Strategic Recommendations</h4>
                          <ul className="space-y-2">
                            {(analysis.overall_assessment?.strategic_recommendations || []).map((rec, i) => (
                              <li key={i} className="text-slate-300 flex items-start gap-2">
                                <Lightbulb className="text-yellow-400 mt-0.5" size={16} />
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
              <EmptyState
                icon={<Brain className="h-8 w-8" />}
                title="Select a Resume Analysis"
                description="Choose a resume from your history or upload a new one to view comprehensive skills intelligence."
              />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}