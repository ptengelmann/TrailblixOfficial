import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, Brain } from 'lucide-react'
import { validators, validateFields } from '@/lib/validation'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  const validateForm = () => {
    const newErrors = validateFields(
      { email, password, confirmPassword },
      {
        email: validators.email,
        password: validators.password,
        confirmPassword: (value) => validators.passwordMatch(password, value)
      }
    )
    
    if (!agreedToTerms) {
      newErrors.terms = 'Please agree to the Terms of Service and Privacy Policy'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      
      setSuccess(true)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setAgreedToTerms(false)
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Failed to create account. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-4">
            Check your email
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            We've sent you a verification link. Please check your email to confirm your account and start your career intelligence analysis.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Back to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex">
      {/* Left side - Signup Form */}
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
              Start your career intelligence
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Get AI-powered insights in under 5 minutes
            </p>
          </div>

          {/* Signup Form */}
          <div className="space-y-6">
            {/* Email */}
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
                    if (errors.email) {
                      const { email, ...rest } = errors
                      setErrors(rest)
                    }
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      const { password, ...rest } = errors
                      setErrors(rest)
                    }
                  }}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Create a secure password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
              {!errors.password && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Must be 8+ characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) {
                      const { confirmPassword, ...rest } = errors
                      setErrors(rest)
                    }
                  }}
                  className={`block w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked)
                      if (errors.terms) {
                        const { terms, ...rest } = errors
                        setErrors(rest)
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-slate-600 dark:text-slate-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.terms}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Start free analysis
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Sign in instead
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Your data is encrypted and securely stored. We never share your information.
          </p>
        </div>
      </div>

      {/* Right side - Value Proposition */}
      <div className="hidden lg:flex lg:flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Join professionals accelerating their careers
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Get personalized AI insights, strategic career planning, and market intelligence that actually works.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Setup time', value: '5 minutes', desc: 'Complete analysis ready' },
              { label: 'Career forecasting', value: '18 months', desc: 'Strategic planning horizon' },
              { label: 'Success rate', value: '91%', desc: 'Users achieve goals' },
              { label: 'Avg salary increase', value: '+73%', desc: 'Within 12 months' }
            ].map((stat, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-500">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-900 dark:text-white font-medium">{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
              Free analysis includes:
            </div>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Skills gap identification</li>
              <li>• Salary benchmarking</li>
              <li>• Career path mapping</li>
              <li>• Market trend insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}