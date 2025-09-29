import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronRight, ChevronLeft, Briefcase, Target, Award, MapPin, Clock, TrendingUp } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    career_stage: '',
    primary_goal: '',
    timeline: '',
    target_role: '',
    target_industry: '',
    work_preference: '',
    current_situation: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

const handleSubmit = async () => {
  if (!user) return

  setLoading(true)
  try {
    // First check if a record exists
    const { data: existing } = await supabase
      .from('career_objectives')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('career_objectives')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      // Insert new record
      const { error } = await supabase
        .from('career_objectives')
        .insert({
          user_id: user.id,
          ...formData,
        })

      if (error) throw error
    }

    // Redirect after successful save
    router.push('/dashboard')
  } catch (error: unknown) {
    logger.error('Failed to save career objectives', 'DATABASE', { userId: user?.id, error: error.message, formData })
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    setLoading(false)
  }
}

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-slate-900 dark:text-white mb-4 tracking-tight">
            Let&apos;s Plan Your Career Journey
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Help us understand your goals so we can personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label className="block text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <Briefcase className="text-blue-600 dark:text-blue-500" size={24} />
                  Where are you in your career?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'student', label: 'Student/Recent Graduate' },
                    { value: 'early', label: 'Early Career (1-3 years)' },
                    { value: 'mid', label: 'Mid Career (4-8 years)' },
                    { value: 'senior', label: 'Senior (8+ years)' },
                    { value: 'transition', label: 'Career Transition' },
                    { value: 'returning', label: 'Returning to Work' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateField('career_stage', option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left font-medium ${
                        formData.career_stage === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-750'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <Target className="text-blue-600 dark:text-blue-500" size={24} />
                  What&apos;s your primary goal?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'first_job', label: 'Land my first job' },
                    { value: 'new_job', label: 'Find a new job' },
                    { value: 'promotion', label: 'Get promoted' },
                    { value: 'salary', label: 'Increase salary' },
                    { value: 'switch', label: 'Switch careers' },
                    { value: 'skills', label: 'Develop new skills' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateField('primary_goal', option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left font-medium ${
                        formData.primary_goal === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-750'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <Clock className="text-blue-600 dark:text-blue-500" size={24} />
                  What&apos;s your timeline?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'immediate', label: 'Immediate (1-3 months)' },
                    { value: 'short', label: 'Short-term (3-6 months)' },
                    { value: 'medium', label: 'Medium-term (6-12 months)' },
                    { value: 'long', label: 'Long-term (1+ year)' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateField('timeline', option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left font-medium ${
                        formData.timeline === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-750'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <label className="block text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <Award className="text-blue-600 dark:text-blue-500" size={24} />
                  What&apos;s your target role?
                </label>
                <input
                  type="text"
                  value={formData.target_role}
                  onChange={(e) => updateField('target_role', e.target.value)}
                  placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <TrendingUp className="text-blue-600 dark:text-blue-500" size={24} />
                  Preferred industry
                </label>
                <input
                  type="text"
                  value={formData.target_industry}
                  onChange={(e) => updateField('target_industry', e.target.value)}
                  placeholder="e.g., Tech, Finance, Healthcare, E-commerce"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <MapPin className="text-blue-600 dark:text-blue-500" size={24} />
                  Work preference
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'onsite', label: 'On-site' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateField('work_preference', option.value)}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        formData.work_preference === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-750'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Tell us about your current situation
                </label>
                <textarea
                  value={formData.current_situation}
                  onChange={(e) => updateField('current_situation', e.target.value)}
                  placeholder="What&apos;s your current role? What challenges are you facing? What are you looking to change?"
                  rows={6}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  This helps us personalize your experience and recommendations
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center gap-2 font-medium"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.career_stage || !formData.primary_goal || !formData.timeline)) ||
                  (step === 2 && (!formData.target_role || !formData.work_preference))
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}