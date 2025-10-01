// src/pages/settings.tsx
// Enhanced user settings with proper security and account deletion

import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/PageLayout'
import Link from 'next/link'
import {
  Mail, Lock, Trash2, Loader2, User,
  Eye, EyeOff, AlertTriangle, Download,
  CheckCircle, XCircle, Crown, CreditCard
} from 'lucide-react'

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { plan, isPro, subscription } = useSubscription()
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
    } catch (error: unknown) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to update email')
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
    } catch (error: unknown) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to update password')
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
    } catch (error: unknown) {
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      showMessage('success', 'Account deleted. Redirecting...')
      
      setTimeout(() => {
        signOut()
        router.push('/')
      }, 2000)
    } catch (error: unknown) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (authLoading) {
    return (
      <PageLayout>
        <div className="text-slate-900 dark:text-white">Loading...</div>
      </PageLayout>
    )
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Account Settings</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your account preferences and subscription
          </p>
        </div>

        {/* Message Banner */}
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
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Account Info & Subscription */}
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={18} className="text-slate-600 dark:text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Account</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Member Since</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                    {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className={`rounded-lg border p-5 ${
              isPro
                ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                {isPro ? (
                  <Crown size={18} className="text-purple-600 dark:text-purple-400" />
                ) : (
                  <CreditCard size={18} className="text-slate-600 dark:text-slate-400" />
                )}
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Subscription</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Plan</label>
                  <p className={`text-sm font-semibold mt-1 ${
                    isPro ? 'text-purple-700 dark:text-purple-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {plan?.name || 'Free'}
                  </p>
                </div>
                {isPro && subscription?.currentPeriodEnd && (
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Renews On</label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
                <Link
                  href="/pricing"
                  className={`block text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isPro
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                </Link>
              </div>
            </div>

            {/* Data Export */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Download size={18} className="text-slate-600 dark:text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Export Data</h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Download all your data in JSON format
              </p>
              <button
                onClick={handleExportData}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                Download Data
              </button>
            </div>
          </div>

          {/* Right Column - Security Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Change Email */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Mail size={18} className="text-slate-600 dark:text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Change Email</h2>
              </div>
              <form onSubmit={handleEmailChange} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="your.new@email.com"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={emailLoading}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showEmailPassword ? "text" : "password"}
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter password to confirm"
                      className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={emailLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showEmailPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={emailLoading || !newEmail || !emailPassword}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {emailLoading && <Loader2 size={16} className="animate-spin" />}
                  Update Email
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={18} className="text-slate-600 dark:text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Current Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={passwordLoading}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={passwordLoading}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={passwordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                <h2 className="text-base font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
              </div>
              <p className="text-xs text-red-600 dark:text-red-300 mb-4">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>

              {!showDeleteDialog ? (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-red-100 dark:bg-red-950/70 rounded-lg border border-red-300 dark:border-red-800">
                  <p className="text-sm text-red-900 dark:text-red-100 font-semibold">Are you absolutely sure?</p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      {deleteLoading && <Loader2 size={16} className="animate-spin" />}
                      Permanently Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteDialog(false)
                        setDeleteConfirmation('')
                        setDeletePassword('')
                      }}
                      className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}