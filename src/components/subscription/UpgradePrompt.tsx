// Upgrade Prompt Component - Shown when users hit limits or access Pro features

import Link from 'next/link'
import { Crown, ArrowRight, Check, X, Sparkles } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface UpgradePromptProps {
  feature?: string
  title?: string
  description?: string
  compact?: boolean
  onClose?: () => void
}

export default function UpgradePrompt({
  feature,
  title,
  description,
  compact = false,
  onClose
}: UpgradePromptProps) {
  const { plan, usage, isPro } = useSubscription()

  // Don't show if already Pro
  if (isPro) {
    return null
  }

  const defaultTitle = feature
    ? `Unlock ${feature.replace(/_/g, ' ')}`
    : 'Upgrade to Pro'

  const defaultDescription = feature
    ? `This feature is available with a Pro subscription. Upgrade to unlock unlimited AI insights and advanced career features.`
    : 'Get unlimited access to all AI-powered features and accelerate your career growth.'

  const proFeatures = [
    'Unlimited AI career insights',
    'Advanced salary forecasting (18 months)',
    'Skills gap analysis',
    'Daily personalized tasks',
    'Full networking tracker',
    'Career path mapping',
    'Priority support'
  ]

  const freeFeatures = [
    'Basic job search',
    '5 AI insights per month',
    'Basic salary data',
    'Simple career tracking'
  ]

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Crown size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {title || defaultTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {description || defaultDescription}
            </p>
            {usage && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Monthly AI Insights</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {usage.ai_insights.current} / {usage.ai_insights.limit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(usage.ai_insights.percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Sparkles size={18} />
              Upgrade to Pro
              <ArrowRight size={18} />
            </Link>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Crown size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          {title || defaultTitle}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {description || defaultDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Plan */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Free Plan</h3>
            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full">
              Current
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            $0<span className="text-lg font-normal text-slate-600 dark:text-slate-400">/month</span>
          </div>
          <ul className="space-y-3">
            {freeFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border-2 border-blue-600 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
            RECOMMENDED
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pro Plan</h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
              Upgrade
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            $15<span className="text-lg font-normal text-slate-600 dark:text-slate-400">/month</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">14-day free trial</p>
          <ul className="space-y-3 mb-6">
            {proFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-900 dark:text-white font-medium">{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="block w-full text-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
          >
            Start 14-Day Free Trial
          </Link>
        </div>
      </div>

      {usage && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Your Current Usage</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">Monthly AI Insights</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {usage.ai_insights.current} / {usage.ai_insights.limit}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    usage.ai_insights.percentage >= 80
                      ? 'bg-red-600'
                      : usage.ai_insights.percentage >= 50
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(usage.ai_insights.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
