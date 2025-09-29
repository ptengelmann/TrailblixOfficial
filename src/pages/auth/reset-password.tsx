import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, XCircle, Loader2, Brain } from 'lucide-react'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      
      if (error) throw error
      
      setMessage({ 
        type: 'success', 
        text: 'Password reset link sent! Check your email.' 
      })
      setEmail('')
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessage({ 
        type: 'error', 
        text: errorMessage || 'Failed to send reset link. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Traiblix
            </h1>
          </Link>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-2">
            Reset password
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Get back to your career intelligence dashboard
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                We&apos;ll send you a secure link to reset your password
              </p>
            </div>

            {message && (
              <div className={`flex items-start gap-3 p-4 rounded-lg border ${
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

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Security note */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          For security, reset links expire after 1 hour
        </p>
      </div>
    </div>
  )
}