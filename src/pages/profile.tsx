// src/pages/profile.tsx - Unified Profile & Career Goals with Better UX
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { validators } from '@/lib/validation'
import { CheckCircle, XCircle, User, Target, Save, Edit3, Check, X } from 'lucide-react'

interface Profile {
  full_name: string
  current_role: string
  location: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
}

interface CareerGoals {
  target_role: string
  target_industry: string
  primary_goal: string
  timeline: string
  career_stage: string
  work_preference: string
  current_situation: string
}

export default function UnifiedProfile() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState<'none' | 'profile' | 'career'>('none')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    current_role: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  })

  const [careerGoals, setCareerGoals] = useState<CareerGoals>({
    target_role: '',
    target_industry: '',
    primary_goal: '',
    timeline: '',
    career_stage: '',
    work_preference: '',
    current_situation: ''
  })

  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [hasExistingGoals, setHasExistingGoals] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    setLoading(true)
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          current_role: profileData.current_role || '',
          location: profileData.location || '',
          linkedin_url: profileData.linkedin_url || '',
          github_url: profileData.github_url || '',
          portfolio_url: profileData.portfolio_url || '',
        })
        setHasExistingProfile(!!profileData.full_name || !!profileData.current_role)
      }

      // Load career goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('career_objectives')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (goalsError && goalsError.code !== 'PGRST116') {
        throw goalsError
      }

      if (goalsData) {
        setCareerGoals({
          target_role: goalsData.target_role || '',
          target_industry: goalsData.target_industry || '',
          primary_goal: goalsData.primary_goal || '',
          timeline: goalsData.timeline || '',
          career_stage: goalsData.career_stage || '',
          work_preference: goalsData.work_preference || '',
          current_situation: goalsData.current_situation || ''
        })
        setHasExistingGoals(!!goalsData.target_role)
      }

    } catch (error: any) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Failed to load your information' })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (section: 'profile' | 'career') => {
    const newErrors: { [key: string]: string } = {}
    
    if (section === 'profile') {
      if (profile.linkedin_url) {
        const result = validators.url(profile.linkedin_url)
        if (!result.isValid) newErrors.linkedin_url = result.error!
      }
      if (profile.github_url) {
        const result = validators.url(profile.github_url)
        if (!result.isValid) newErrors.github_url = result.error!
      }
      if (profile.portfolio_url) {
        const result = validators.url(profile.portfolio_url)
        if (!result.isValid) newErrors.portfolio_url = result.error!
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (section: 'profile' | 'career') => {
    if (!validateForm(section)) {
      setMessage({ type: 'error', text: 'Please fix the errors below' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      if (section === 'profile') {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user?.id,
            email: user?.email,
            ...profile,
            updated_at: new Date().toISOString(),
          })

        if (error) throw error
        setHasExistingProfile(true)
      } else {
        // Handle career goals with proper upsert logic like onboarding
        try {
          // First check if a record exists
          const { data: existing } = await supabase
            .from('career_objectives')
            .select('id')
            .eq('user_id', user?.id)
            .single()

          if (existing) {
            // Update existing record
            const { error } = await supabase
              .from('career_objectives')
              .update({
                ...careerGoals,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user?.id)

            if (error) throw error
          } else {
            // Insert new record
            const { error } = await supabase
              .from('career_objectives')
              .insert({
                user_id: user?.id,
                ...careerGoals,
              })

            if (error) throw error
          }
          
          setHasExistingGoals(true)
        } catch (careerError) {
          throw careerError
        }
      }

      setMessage({ type: 'success', text: `${section === 'profile' ? 'Profile' : 'Career goals'} saved successfully!` })
      setEditingSection('none')
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error saving ${section}: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    setEditingSection('none')
    setErrors({})
    await loadUserData() // Reload original data
  }

  const handleChange = (section: 'profile' | 'career', field: string, value: string) => {
    if (section === 'profile') {
      setProfile(prev => ({ ...prev, [field]: value }))
    } else {
      setCareerGoals(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error for this field
    if (errors[field]) {
      const { [field]: removed, ...rest } = errors
      setErrors(rest)
    }
  }

  if (authLoading || loading) {
    return (
      <PageLayout>
        <LoadingSkeleton variant="profile" />
      </PageLayout>
    )
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">
            Profile & Career Goals
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your professional information and career objectives
          </p>
        </div>

        {message && (
          <div className={`mb-6 flex items-start gap-3 p-4 rounded-lg border ${
            message.type === 'error' 
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' 
              : 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
          }`}>
            {message.type === 'error' ? (
              <XCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="text-blue-600 dark:text-blue-500" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Professional Profile</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {hasExistingProfile ? 'Your current profile information' : 'Set up your basic professional information'}
                </p>
              </div>
            </div>
            {editingSection === 'profile' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave('profile')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Check size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 rounded-lg text-slate-900 dark:text-white text-sm flex items-center gap-2 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingSection('profile')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
              >
                <Edit3 size={16} />
                {hasExistingProfile ? 'Edit' : 'Add Info'}
              </button>
            )}
          </div>

          {editingSection === 'profile' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => handleChange('profile', 'full_name', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Current Role</label>
                  <input
                    type="text"
                    value={profile.current_role}
                    onChange={(e) => handleChange('profile', 'current_role', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senior Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleChange('profile', 'location', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">LinkedIn</label>
                  <input
                    type="url"
                    value={profile.linkedin_url}
                    onChange={(e) => handleChange('profile', 'linkedin_url', e.target.value)}
                    className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      errors.linkedin_url ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                    placeholder="linkedin.com/in/johndoe"
                  />
                  {errors.linkedin_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.linkedin_url}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">GitHub</label>
                  <input
                    type="url"
                    value={profile.github_url}
                    onChange={(e) => handleChange('profile', 'github_url', e.target.value)}
                    className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      errors.github_url ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                    placeholder="github.com/johndoe"
                  />
                  {errors.github_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.github_url}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Portfolio</label>
                  <input
                    type="url"
                    value={profile.portfolio_url}
                    onChange={(e) => handleChange('profile', 'portfolio_url', e.target.value)}
                    className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      errors.portfolio_url ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                    placeholder="johndoe.com"
                  />
                  {errors.portfolio_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.portfolio_url}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`space-y-4 ${!hasExistingProfile ? 'opacity-60' : ''}`}>
              {hasExistingProfile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Name</p>
                      <p className="text-slate-900 dark:text-white">{profile.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Current Role</p>
                      <p className="text-slate-900 dark:text-white">{profile.current_role || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Location</p>
                      <p className="text-slate-900 dark:text-white">{profile.location || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">LinkedIn</p>
                      <p className="text-slate-900 dark:text-white text-sm">{profile.linkedin_url || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">GitHub</p>
                      <p className="text-slate-900 dark:text-white text-sm">{profile.github_url || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Portfolio</p>
                      <p className="text-slate-900 dark:text-white text-sm">{profile.portfolio_url || 'Not set'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <User className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No profile information yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Click "Add Info" to set up your professional profile</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Career Goals Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="text-blue-600 dark:text-blue-500" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Career Goals</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {hasExistingGoals ? 'Your current career objectives' : 'Define your career aspirations and goals'}
                </p>
              </div>
            </div>
            {editingSection === 'career' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave('career')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Check size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 rounded-lg text-slate-900 dark:text-white text-sm flex items-center gap-2 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingSection('career')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
              >
                <Edit3 size={16} />
                {hasExistingGoals ? 'Edit' : 'Set Goals'}
              </button>
            )}
          </div>

          {editingSection === 'career' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Target Role</label>
                  <input
                    type="text"
                    value={careerGoals.target_role}
                    onChange={(e) => handleChange('career', 'target_role', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senior Product Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Target Industry</label>
                  <select
                    value={careerGoals.target_industry}
                    onChange={(e) => handleChange('career', 'target_industry', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an industry</option>
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="consulting">Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Primary Goal</label>
                  <select
                    value={careerGoals.primary_goal}
                    onChange={(e) => handleChange('career', 'primary_goal', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your primary goal</option>
                    <option value="promotion">Get promoted</option>
                    <option value="career_change">Change careers</option>
                    <option value="new_job">Find a new job</option>
                    <option value="skill_development">Develop new skills</option>
                    <option value="salary_increase">Increase salary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Timeline</label>
                  <select
                    value={careerGoals.timeline}
                    onChange={(e) => handleChange('career', 'timeline', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">0-3 months</option>
                    <option value="short">3-6 months</option>
                    <option value="medium">6-12 months</option>
                    <option value="long">1+ years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Career Stage</label>
                  <select
                    value={careerGoals.career_stage}
                    onChange={(e) => handleChange('career', 'career_stage', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your stage</option>
                    <option value="student">Student</option>
                    <option value="early">Early Career (0-3 years)</option>
                    <option value="mid">Mid Career (3-8 years)</option>
                    <option value="senior">Senior (8+ years)</option>
                    <option value="transition">Career Transition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Work Preference</label>
                  <select
                    value={careerGoals.work_preference}
                    onChange={(e) => handleChange('career', 'work_preference', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select preference</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Current Situation</label>
                <textarea
                  value={careerGoals.current_situation}
                  onChange={(e) => handleChange('career', 'current_situation', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Briefly describe your current career situation and what you're looking to achieve..."
                />
              </div>
            </div>
          ) : (
            <div className={`space-y-4 ${!hasExistingGoals ? 'opacity-60' : ''}`}>
              {hasExistingGoals ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Target Role</p>
                      <p className="text-slate-900 dark:text-white">{careerGoals.target_role || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Industry</p>
                      <p className="text-slate-900 dark:text-white capitalize">{careerGoals.target_industry || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Timeline</p>
                      <p className="text-slate-900 dark:text-white">{careerGoals.timeline || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Primary Goal</p>
                      <p className="text-slate-900 dark:text-white capitalize">{careerGoals.primary_goal?.replace('_', ' ') || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Career Stage</p>
                      <p className="text-slate-900 dark:text-white capitalize">{careerGoals.career_stage || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Work Preference</p>
                      <p className="text-slate-900 dark:text-white capitalize">{careerGoals.work_preference || 'Not set'}</p>
                    </div>
                  </div>
                  {careerGoals.current_situation && (
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Current Situation</p>
                      <p className="text-slate-900 dark:text-white text-sm">{careerGoals.current_situation}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <Target className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No career goals defined</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Click "Set Goals" to define your career aspirations</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}