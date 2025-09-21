import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronRight, ChevronLeft, Briefcase, Target, Award, MapPin, Clock, TrendingUp } from 'lucide-react'

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
  } catch (error: any) {
    console.error('Error saving objectives:', error)
    alert(`Error: ${error.message}`)
  } finally {
    setLoading(false)
  }
}

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Let's Plan Your Career Journey
          </h1>
          <p className="text-slate-400">Help us understand your goals so we can personalize your experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="text-violet-400" size={24} />
                  Where are you in your career?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.career_stage === option.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="text-violet-400" size={24} />
                  What's your primary goal?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.primary_goal === option.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="text-violet-400" size={24} />
                  What's your timeline?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'immediate', label: 'Immediate (1-3 months)' },
                    { value: 'short', label: 'Short-term (3-6 months)' },
                    { value: 'medium', label: 'Medium-term (6-12 months)' },
                    { value: 'long', label: 'Long-term (1+ year)' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateField('timeline', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.timeline === option.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-600 hover:border-slate-500'
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
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="text-violet-400" size={24} />
                  What's your target role?
                </label>
                <input
                  type="text"
                  value={formData.target_role}
                  onChange={(e) => updateField('target_role', e.target.value)}
                  placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-violet-400" size={24} />
                  Preferred industry
                </label>
                <input
                  type="text"
                  value={formData.target_industry}
                  onChange={(e) => updateField('target_industry', e.target.value)}
                  placeholder="e.g., Tech, Finance, Healthcare, E-commerce"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="text-violet-400" size={24} />
                  Work preference
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'onsite', label: 'On-site' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateField('work_preference', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.work_preference === option.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-600 hover:border-slate-500'
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
                <label className="block text-lg font-semibold mb-4">
                  Tell us about your current situation
                </label>
                <textarea
                  value={formData.current_situation}
                  onChange={(e) => updateField('current_situation', e.target.value)}
                  placeholder="What's your current role? What challenges are you facing? What are you looking to change?"
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-sm text-slate-400 mt-2">This helps us personalize your experience and recommendations</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-slate-600 rounded-lg hover:border-slate-500 transition-all flex items-center gap-2"
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
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2"
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