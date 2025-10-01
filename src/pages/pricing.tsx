import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  Check, X, Zap, Crown, ArrowRight, HelpCircle,
  Brain, BarChart3, Target, Users, TrendingUp, Flame, Award, MessageCircle
} from 'lucide-react'

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for exploring career options',
      price: { monthly: 0, annual: 0 },
      icon: Target,
      features: [
        { text: 'Basic job search & browsing', included: true },
        { text: '5 AI career insights per month', included: true },
        { text: 'Basic salary data access', included: true },
        { text: 'Simple career tracking', included: true },
        { text: 'Community support', included: true },
        { text: 'Unlimited AI insights', included: false },
        { text: 'Advanced career predictions', included: false },
        { text: 'Skills gap analysis', included: false },
        { text: 'Networking tracker', included: false },
        { text: 'Daily personalized tasks', included: false },
        { text: '18-month salary forecasting', included: false },
        { text: 'Career path mapping', included: false }
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'slate'
    },
    {
      name: 'Pro',
      description: 'For serious career growth',
      price: { monthly: 15, annual: 144 },
      icon: Crown,
      features: [
        { text: 'Everything in Free, plus:', included: true, bold: true },
        { text: 'Unlimited AI career insights', included: true },
        { text: 'Advanced career predictions (94% accuracy)', included: true },
        { text: 'Comprehensive skills gap analysis', included: true },
        { text: 'Full networking activity tracker', included: true },
        { text: 'Daily personalized career tasks', included: true },
        { text: 'Gamification (XP, streaks, levels)', included: true },
        { text: '18-month salary forecasting', included: true },
        { text: 'Detailed career path mapping', included: true },
        { text: 'Job market trend analysis', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Early access to new features', included: true }
      ],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'blue'
    }
  ]

  const faqs = [
    {
      question: 'Can I switch between plans?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and debit cards through our secure payment processor.'
    },
    {
      question: 'Is there a free trial for Pro?',
      answer: 'Yes! Pro plans come with a 14-day free trial. No credit card required. You can cancel anytime during the trial with no charges.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Absolutely. You can cancel your subscription at any time from your account settings. You\'ll continue to have access until the end of your billing period.'
    },
    {
      question: 'How accurate are the AI predictions?',
      answer: 'Our AI achieves 94% accuracy by analyzing millions of job postings, salary data points, and career trajectories. Accuracy improves as you use the platform more.'
    },
    {
      question: 'Do you offer student or nonprofit discounts?',
      answer: 'Yes! We offer special pricing for students and nonprofit organizations. Contact our support team with verification documents for details.'
    }
  ]

  const comparison = [
    {
      category: 'AI Intelligence',
      icon: Brain,
      features: [
        { name: 'AI career insights', free: '5 per month', pro: 'Unlimited' },
        { name: 'Market trend analysis', free: 'Basic', pro: 'Advanced' },
        { name: 'Prediction accuracy', free: 'Standard', pro: '94%' },
        { name: 'Personalized recommendations', free: false, pro: true }
      ]
    },
    {
      category: 'Career Planning',
      icon: Target,
      features: [
        { name: 'Skills gap analysis', free: false, pro: true },
        { name: 'Career path mapping', free: false, pro: true },
        { name: 'Salary forecasting', free: 'Current only', pro: '18 months' },
        { name: 'Job matching', free: 'Basic', pro: 'Advanced' }
      ]
    },
    {
      category: 'Daily Tools',
      icon: Flame,
      features: [
        { name: 'Daily career tasks', free: false, pro: true },
        { name: 'Networking tracker', free: 'Limited', pro: 'Full' },
        { name: 'XP & leveling system', free: false, pro: true },
        { name: 'Achievement badges', free: false, pro: true }
      ]
    },
    {
      category: 'Support',
      icon: MessageCircle,
      features: [
        { name: 'Email support', free: 'Community', pro: 'Priority' },
        { name: 'Response time', free: '48-72 hours', pro: '< 24 hours' },
        { name: 'Early feature access', free: false, pro: true },
        { name: 'Dedicated account help', free: false, pro: true }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    if (color === 'blue') {
      return {
        bg: 'bg-blue-600',
        border: 'border-blue-600',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-700',
        light: 'bg-blue-50 dark:bg-blue-950/20'
      }
    }
    return {
      bg: 'bg-slate-600',
      border: 'border-slate-300 dark:border-slate-600',
      text: 'text-slate-600',
      hover: 'hover:bg-slate-700',
      light: 'bg-slate-50 dark:bg-slate-900'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-12 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full mb-6">
              <Zap size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 dark:text-white mb-6">
              Invest in your
              <span className="block mt-2 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                career growth
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light max-w-3xl mx-auto leading-relaxed mb-8">
              Start free and upgrade when you&apos;re ready to unlock the full power of AI-driven career intelligence
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-blue-600 rounded-full transition-colors"
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${billingPeriod === 'annual' ? 'translate-x-7' : ''}`}></div>
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                Annual
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                Save 20%
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, i) => {
                const Icon = plan.icon
                const colors = getColorClasses(plan.color)
                const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual

                return (
                  <div
                    key={i}
                    className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 ${
                      plan.popular ? 'border-blue-600 shadow-2xl' : 'border-slate-200 dark:border-slate-700'
                    } overflow-hidden`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-bl-lg">
                        MOST POPULAR
                      </div>
                    )}

                    <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                      <div className={`w-12 h-12 ${colors.light} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon size={24} className={colors.text} />
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 font-light mb-6">
                        {plan.description}
                      </p>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-slate-900 dark:text-white">
                            ${price}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            /{billingPeriod === 'monthly' ? 'month' : 'year'}
                          </span>
                        </div>
                        {billingPeriod === 'annual' && plan.price.annual > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            ${(plan.price.annual / 12).toFixed(0)}/month when billed annually
                          </p>
                        )}
                      </div>

                      <Link
                        href="/auth/signup"
                        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all mb-8 ${
                          plan.popular
                            ? `${colors.bg} text-white ${colors.hover}`
                            : 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-600'
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight size={18} />
                      </Link>

                      <ul className="space-y-4">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X size={20} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${
                              feature.bold
                                ? 'font-semibold text-slate-900 dark:text-white'
                                : feature.included
                                ? 'text-slate-700 dark:text-slate-300'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white mb-4">
                Detailed <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">comparison</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                Everything you need to know about each plan
              </p>
            </div>

            <div className="space-y-8">
              {comparison.map((section, i) => {
                const Icon = section.icon
                return (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {section.category}
                        </h3>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                      {section.features.map((feature, j) => (
                        <div key={j} className="grid grid-cols-3 gap-4 px-6 py-4">
                          <div className="col-span-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {feature.name}
                          </div>
                          <div className="text-center">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? (
                                <Check size={18} className="text-green-600 dark:text-green-400 mx-auto" />
                              ) : (
                                <X size={18} className="text-slate-300 dark:text-slate-600 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-slate-600 dark:text-slate-400">{feature.free}</span>
                            )}
                          </div>
                          <div className="text-center">
                            {typeof feature.pro === 'boolean' ? (
                              feature.pro ? (
                                <Check size={18} className="text-green-600 dark:text-green-400 mx-auto" />
                              ) : (
                                <X size={18} className="text-slate-300 dark:text-slate-600 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-slate-900 dark:text-white font-medium">{feature.pro}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white mb-4">
                Frequently <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">asked questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <HelpCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Still have questions?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all"
              >
                Contact our team
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Start your career transformation today
            </h2>
            <p className="text-lg text-white/90 font-light mb-8">
              Join TrailBlix and unlock AI-powered insights to accelerate your career growth
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get started for free
              <ArrowRight size={18} />
            </Link>
            <p className="text-sm text-white/70 mt-4">
              No credit card required • 14-day Pro trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
