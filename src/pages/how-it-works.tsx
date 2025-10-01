import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Brain, BarChart3, Target, TrendingUp, Users, Zap,
  Search, MessageCircle, BookOpen, Award, ArrowRight, CheckCircle,
  Calendar, Coffee, FileText, Flame
} from 'lucide-react'
import Link from 'next/link'

export default function HowItWorks() {
  const workflow = [
    {
      step: '1',
      icon: Search,
      title: 'Set Your Career Goals',
      description: 'Tell us about your current role, skills, desired position, and career aspirations. Our AI needs just a few minutes to understand your unique profile and objectives.'
    },
    {
      step: '2',
      icon: Brain,
      title: 'AI Market Analysis',
      description: 'Our system analyzes millions of job postings, salary data points, and career trajectories to understand current market trends and opportunities relevant to your goals.'
    },
    {
      step: '3',
      icon: BarChart3,
      title: 'Personalized Insights',
      description: 'Receive tailored recommendations including salary forecasts, skills to learn, job opportunities, and actionable steps to advance your career based on real market data.'
    },
    {
      step: '4',
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your growth with daily tasks, networking activities, skill development tracking, and achievement milestones that keep you on target toward your goals.'
    }
  ]

  const coreFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Our proprietary AI engine analyzes the job market in real-time to provide you with insights that matter.',
      capabilities: [
        'Real-time analysis of 47,000+ job postings daily',
        'Pattern recognition across 12,300+ professional profiles',
        'Predictive algorithms with 94% accuracy rate',
        'Natural language processing for intelligent matching',
        'Continuous learning from market changes'
      ],
      stat: { value: '47K+', label: 'Jobs analyzed daily' },
      color: 'blue'
    },
    {
      icon: Target,
      title: 'Precision Job Matching',
      description: 'Get matched with opportunities that align perfectly with your skills, experience, and career aspirations.',
      capabilities: [
        'Advanced skills gap analysis',
        'Personalized job recommendations',
        'Industry and role compatibility scoring',
        'Company culture fit assessment',
        'Location and remote work preferences'
      ],
      stat: { value: '94%', label: 'Match accuracy' },
      color: 'indigo'
    },
    {
      icon: TrendingUp,
      title: 'Salary Intelligence',
      description: 'Understand your true market value and make informed decisions about compensation.',
      capabilities: [
        '18-month salary trajectory forecasting',
        'Location-based compensation benchmarking',
        'Industry-specific salary trends',
        'Negotiation insights and strategies',
        'Total compensation package analysis'
      ],
      stat: { value: '127%', label: 'Avg salary increase' },
      color: 'green'
    },
    {
      icon: Users,
      title: 'Career Path Mapping',
      description: 'Visualize your career trajectory and discover the optimal path to reach your professional goals.',
      capabilities: [
        'Role progression timeline predictions',
        'Skills required for advancement',
        'Alternative career path exploration',
        'Success probability calculations',
        'Milestone tracking and recommendations'
      ],
      stat: { value: '12.3K', label: 'Career paths analyzed' },
      color: 'purple'
    }
  ]

  const dailyTools = [
    {
      icon: Flame,
      title: 'Daily Career Tasks',
      description: 'Stay consistent with gamified daily tasks that build career momentum',
      features: ['Personalized task recommendations', 'Streak tracking', 'XP and leveling system']
    },
    {
      icon: MessageCircle,
      title: 'Networking Tracker',
      description: 'Log and monitor your professional networking activities',
      features: ['Connection tracking', 'Follow-up reminders', 'Network growth analytics']
    },
    {
      icon: BookOpen,
      title: 'Skill Development',
      description: 'Get personalized learning recommendations based on market demand',
      features: ['Skills gap identification', 'Learning resource suggestions', 'Progress tracking']
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Stay motivated with achievements, levels, and career milestones',
      features: ['Career progression levels', 'Achievement badges', 'Progress celebration']
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; icon: string; border: string; gradient: string } } = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        icon: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        gradient: 'from-blue-600 to-blue-700'
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        icon: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
        gradient: 'from-indigo-600 to-indigo-700'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-950/20',
        icon: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        gradient: 'from-green-600 to-green-700'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        icon: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        gradient: 'from-purple-600 to-purple-700'
      }
    }
    return colors[color]
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full mb-6">
              <Zap size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">How It Works</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 dark:text-white mb-6">
              Your career intelligence platform
              <span className="block mt-2 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                powered by AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light max-w-3xl mx-auto leading-relaxed mb-8">
              TrailBlix combines cutting-edge AI with real-time market data to give you the insights you need to make confident career decisions
            </p>
          </div>
        </section>

        {/* Workflow Steps */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white mb-4">
                Get started in <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">four simple steps</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                From signup to insights in less than 5 minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflow.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="relative">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 h-full hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {item.step}
                        </div>
                        <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    {i < workflow.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <ArrowRight size={20} className="text-blue-400 dark:text-blue-600" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white mb-4">
                Powerful <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI features</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                Everything you need to accelerate your career growth
              </p>
            </div>

            <div className="space-y-20">
              {coreFeatures.map((feature, i) => {
                const Icon = feature.icon
                const colors = getColorClasses(feature.color)
                const isEven = i % 2 === 0

                return (
                  <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}>
                    <div className={`${isEven ? '' : 'lg:col-start-2'}`}>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 ${colors.bg} border ${colors.border} rounded-full mb-6`}>
                        <Icon size={16} className={colors.icon} />
                        <span className={`${colors.icon} text-sm font-semibold`}>Core Feature</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white mb-4">
                        {feature.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-6">
                        {feature.description}
                      </p>

                      <ul className="space-y-3">
                        {feature.capabilities.map((item, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle size={20} className={`${colors.icon} flex-shrink-0 mt-0.5`} />
                            <span className="text-slate-700 dark:text-slate-300 font-light">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`${isEven ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1'}`}>
                      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                        <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                          <Icon size={32} className="text-white" />
                        </div>
                        <div className="text-center mb-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
                          <div className={`text-4xl font-bold ${colors.icon} mb-2`}>
                            {feature.stat.value}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {feature.stat.label}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className={`h-3 ${colors.bg} rounded`} style={{ width: '90%' }}></div>
                          <div className={`h-3 ${colors.bg} rounded`} style={{ width: '75%' }}></div>
                          <div className={`h-3 ${colors.bg} rounded`} style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Daily Tools */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white mb-4">
                Daily <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">career tools</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                Build momentum with tools designed for daily engagement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyTools.map((tool, i) => {
                const Icon = tool.icon
                return (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-light mb-4">
                      {tool.description}
                    </p>
                    <ul className="space-y-2">
                      {tool.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Ready to transform your career?
            </h2>
            <p className="text-lg text-white/90 font-light mb-8">
              Start using AI-powered insights to accelerate your career growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start free analysis
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View pricing
              </Link>
            </div>
            <p className="text-sm text-white/70 mt-4">
              No credit card required • 5-minute setup • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
