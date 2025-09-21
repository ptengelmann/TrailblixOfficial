// src/pages/profile.tsx
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { validators } from '@/lib/validation'
import { CheckCircle, XCircle } from 'lucide-react'

interface Profile {
  full_name: string
  current_role: string
  location: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          current_role: data.current_role || '',
          location: data.location || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          portfolio_url: data.portfolio_url || '',
        })
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    // Validate URLs if provided
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors below' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          email: user?.email,
          ...profile,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error saving profile: ' + error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Career Profile
          </h1>
          <p className="text-slate-400 mt-2">
            Update your professional information
          </p>
        </div>

        {message && (
          <div className={`mb-6 flex items-start gap-3 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-950/50 border border-red-800 text-red-200' 
              : 'bg-green-950/50 border border-green-800 text-green-200'
          }`}>
            {message.type === 'error' ? (
              <XCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Current Role</label>
            <input
              type="text"
              value={profile.current_role}
              onChange={(e) => handleChange('current_role', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="San Francisco, CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">LinkedIn URL</label>
            <input
              type="url"
              value={profile.linkedin_url}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.linkedin_url ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-violet-500'
              }`}
              placeholder="https://linkedin.com/in/johndoe"
            />
            {errors.linkedin_url && (
              <p className="mt-1 text-sm text-red-400">{errors.linkedin_url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">GitHub URL</label>
            <input
              type="url"
              value={profile.github_url}
              onChange={(e) => handleChange('github_url', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.github_url ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-violet-500'
              }`}
              placeholder="https://github.com/johndoe"
            />
            {errors.github_url && (
              <p className="mt-1 text-sm text-red-400">{errors.github_url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Portfolio URL</label>
            <input
              type="url"
              value={profile.portfolio_url}
              onChange={(e) => handleChange('portfolio_url', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.portfolio_url ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-violet-500'
              }`}
              placeholder="https://johndoe.com"
            />
            {errors.portfolio_url && (
              <p className="mt-1 text-sm text-red-400">{errors.portfolio_url}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg font-medium hover:from-violet-600 hover:to-indigo-600 transition-all disabled:opacity-50 text-white"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </PageLayout>
  )
}