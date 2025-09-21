import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import { Mail, Lock, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function Settings() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: 'Confirmation email sent! Check your new email address to confirm the change.' 
      })
      setNewEmail('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setPasswordLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      // This would need a backend function to fully delete user data
      alert('Account deletion will be implemented with proper backend cleanup')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <PageLayout><div>Loading...</div></PageLayout>
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

        {message && (
          <div className={`mb-6 flex items-start gap-3 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200' 
              : 'bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200'
          }`}>
            {message.type === 'error' ? (
              <XCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">Email</label>
              <p className="text-slate-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">User ID</label>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Change Email */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email
          </h2>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              disabled={emailLoading}
            />
            <button
              type="submit"
              disabled={emailLoading || !newEmail}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {emailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Email
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              disabled={passwordLoading}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              disabled={passwordLoading}
            />
            <button
              type="submit"
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-400 mb-4">Danger Zone</h2>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      </div>
    </PageLayout>
  )
}