// src/components/landing/PricingSection.tsx
import Link from 'next/link'
import { Check, X } from 'lucide-react'

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: '',
      description: 'Perfect for exploring',
      features: [
        { text: 'Basic CV analysis', included: true },
        { text: 'Career goals setup', included: true },
        { text: '5 job matches per month', included: true },
        { text: 'Advanced AI insights', included: false },
        { text: 'Unlimited job matches', included: false },
        { text: 'Priority support', included: false }
      ],
      cta: 'Start free',
      href: '/auth/signup',
      emphasis: false
    },
    {
      name: 'Professional',
      price: '£29',
      period: '/month',
      description: 'For serious career growth',
      features: [
        { text: 'Advanced CV analysis', included: true },
        { text: 'Career goals setup', included: true },
        { text: 'Unlimited job matches', included: true },
        { text: 'Deep AI insights', included: true },
        { text: 'Skills gap analysis', included: true },
        { text: 'Priority support', included: true }
      ],
      cta: 'Start 7-day trial',
      href: '/auth/signup?plan=pro',
      emphasis: true
    },
    {
      name: 'Teams',
      price: 'Custom',
      period: '',
      description: 'For organisations',
      features: [
        { text: 'Everything in Professional', included: true },
        { text: 'Team analytics', included: true },
        { text: 'Bulk CV processing', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated support', included: true }
      ],
      cta: 'Contact sales',
      href: '/contact',
      emphasis: false
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 font-light">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl ${
                plan.emphasis 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl scale-105' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.emphasis && (
                <div className="absolute -top-4 left-0 right-0 text-center">
                  <span className="inline-flex px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full">
                    Most popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                {/* Plan header */}
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    plan.emphasis ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-medium ${
                      plan.emphasis ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'
                    }`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm ${
                        plan.emphasis ? 'text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`mt-3 text-sm ${
                    plan.emphasis ? 'text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          plan.emphasis ? 'text-white dark:text-slate-900' : 'text-green-500 dark:text-green-400'
                        }`} />
                      ) : (
                        <X className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          plan.emphasis ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-700'
                        }`} />
                      )}
                      <span className={`text-sm ${
                        feature.included 
                          ? plan.emphasis 
                            ? 'text-white dark:text-slate-900' 
                            : 'text-slate-700 dark:text-slate-300'
                          : plan.emphasis
                            ? 'text-slate-500 dark:text-slate-400 line-through'
                            : 'text-slate-400 dark:text-slate-600 line-through'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block w-full text-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    plan.emphasis
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}