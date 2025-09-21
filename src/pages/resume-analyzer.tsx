import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

interface ResumeAnalysis {
  score: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
}

export default function ResumeAnalyzer() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

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
      setAnalysis(null) // Reset analysis when new file is selected
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
      // Fallback to filename if extraction fails
      throw new Error('Could not extract text from PDF. Please ensure it\'s a valid PDF file.')
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (!file || !user) return

    setUploading(true)
    setError('')

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName)

      setUploading(false)
      setAnalyzing(true)

      // Extract text and analyze
      const resumeText = await extractTextFromPDF(file)

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const analysisData = await response.json()

      // Save to database
      await supabase.from('resumes').insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        ai_analysis: analysisData,
        score: analysisData.score
      })

      setAnalysis(analysisData)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-violet-400 hover:text-violet-300 mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-8">
          Resume Analyzer
        </h1>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Upload your resume (PDF or Word)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <Upload className="absolute right-3 top-2.5 text-slate-400" size={20} />
            </div>
            {file && (
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                <FileText size={16} />
                <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          )}

          <button
            onClick={handleUploadAndAnalyze}
            disabled={!file || uploading || analyzing}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg font-medium hover:from-violet-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>Uploading...</>
            ) : analyzing ? (
              <>Analyzing with AI...</>
            ) : (
              <>
                <Upload size={20} />
                Upload & Analyze
              </>
            )}
          </button>
        </div>

        {analysis && (
          <div className="mt-8 bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {analysis.score}/100
              </div>
              <p className="text-slate-400">Overall Resume Score</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="text-xl font-bold text-green-400">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="text-yellow-400" size={24} />
                  <h3 className="text-xl font-bold text-yellow-400">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span className="text-slate-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="text-violet-400" size={24} />
                  <h3 className="text-xl font-bold text-violet-400">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-violet-400 mt-1">•</span>
                      <span className="text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}