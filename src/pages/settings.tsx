// src/pages/settings.tsx
// Enhanced user settings with proper security and account deletion

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import { 
  Mail, Lock, Trash2, Loader2, Shield, 
  Eye, EyeOff, AlertTriangle, Download,
  CheckCircle, XCircle
} from 'lucide-react'

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Account deletion
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)

    try {
      // First, verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: emailPassword
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Then update the email
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error

      showMessage('success', 'Confirmation email sent! Check your new email address.')
      setNewEmail('')
      setEmailPassword('')
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update email')
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)

    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      showMessage('success', 'Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Fetch all user data
      const [profileRes, objectivesRes, resumesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('career_objectives').select('*').eq('user_id', user?.id).single(),
        supabase.from('resumes').select('*').eq('user_id', user?.id)
      ])

      const exportData = {
        user: {
          id: user?.id,
          email: user?.email
        },
        profile: profileRes.data,
        careerObjectives: objectivesRes.data,
        resumes: resumesRes.data,
        exportDate: new Date().toISOString()
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `traiblix-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      showMessage('success', 'Data exported successfully!')
    } catch (error: any) {
      showMessage('error', 'Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE' || !deletePassword) {
      showMessage('error', 'Please type DELETE and enter your password')
      return
    }

    setDeleteLoading(true)

    try {
      // Verify password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: deletePassword
      })

      if (signInError) {
        throw new Error('Password is incorrect')
      }

      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      
      // Call deletion API
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      showMessage('success', 'Account deleted. Redirecting...')
      
      setTimeout(() => {
        signOut()
        router.push('/')
      }, 2000)
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (authLoading) {
    return <PageLayout><div className="text-white">Loading...</div></PageLayout>
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        {/* Message Banner */}
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

        {/* Account Information */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-400" />
            Account Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">User ID</label>
              <p className="text-sm font-mono text-slate-500">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Change Email */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-violet-400" />
            Change Email Address
          </h2>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={emailLoading}
            />
            <div className="relative">
              <input
                type={showEmailPassword ? "text" : "password"}
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Current password (for verification)"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={emailLoading}
              />
              <button
                type="button"
                onClick={() => setShowEmailPassword(!showEmailPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showEmailPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={emailLoading || !newEmail || !emailPassword}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {emailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Email
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-violet-400" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={passwordLoading}
            />
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={passwordLoading}
            />
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>

        {/* Data Export */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-violet-400" />
            Export Your Data
          </h2>
          <p className="text-slate-300 text-sm mb-4">
            Download all your data in JSON format (GDPR compliant)
          </p>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Download Data
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-950/20 rounded-xl border border-red-900/50 p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-red-300 mb-4">
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>
          
          {!showDeleteDialog ? (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-red-950/40 rounded-lg border border-red-900">
              <p className="text-white font-semibold">Are you absolutely sure?</p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-2 bg-slate-800 border border-red-800 rounded-lg text-white placeholder-slate-400"
              />
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-slate-800 border border-red-800 rounded-lg text-white placeholder-slate-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Permanently Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeleteConfirmation('')
                    setDeletePassword('')
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}