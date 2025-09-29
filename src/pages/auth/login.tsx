import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2, Brain } from 'lucide-react'
import { validators } from '@/lib/validation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    const emailResult = validators.email(email)
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error
    }
    
    const passwordResult = validators.required(password, 'Password')
    if (!passwordResult.isValid) {
      newErrors.password = passwordResult.error
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setErrors({ 
        password: errorMessage || 'Invalid email or password' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Traiblix
              </h1>
            </Link>
            <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Access your career intelligence dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
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
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: undefined })
                  }}
                  className={`block w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link 
                  href="/auth/reset-password" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  className={`block w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                New to Traiblix?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Brand/Features */}
      <div className="hidden lg:flex lg:flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Career intelligence that actually works
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Get AI-powered insights, salary forecasting, and strategic career guidance in minutes, not months.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'AI career analysis', value: '15 seconds' },
              { label: 'Prediction accuracy', value: '94%' },
              { label: 'Jobs analyzed', value: '47,000+' },
              { label: 'Average salary increase', value: '+73%' }
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-500">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}