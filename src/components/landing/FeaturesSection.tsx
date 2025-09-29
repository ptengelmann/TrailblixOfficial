import React, { useState } from 'react'
import { Brain, Target, TrendingUp, BarChart3, Users, Zap, Clock, Globe, Shield, Database } from 'lucide-react'

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Brain,
      category: 'AI INTELLIGENCE',
      title: 'Predictive Career Modeling',
      description: 'Advanced machine learning algorithms analyze millions of career data points to predict your professional trajectory with unprecedented accuracy.',
      keyMetrics: [
        { label: 'Prediction Accuracy', value: '94%', color: 'green' },
        { label: 'Data Points Analyzed', value: '47M+', color: 'blue' },
        { label: 'Career Paths Mapped', value: '250K+', color: 'purple' },
        { label: 'Update Frequency', value: 'Real-time', color: 'orange' }
      ],
      capabilities: [
        'Salary trajectory forecasting (18-month projections)',
        'Role transition probability analysis',
        'Market timing recommendations',
        'Skills impact assessment',
        'Industry disruption modeling',
        'Compensation benchmarking'
      ],
      technicalSpecs: [
        'Neural network architecture with 12 layers',
        'Processes 47,000+ job postings daily',
        'Integrates with 15+ job boards globally',
        'Sub-second response time for analysis'
      ]
    },
    {
      icon: Target,
      category: 'PRECISION MATCHING',
      title: 'Intelligent Job Compatibility',
      description: 'Go beyond keyword matching with deep semantic analysis of job requirements, company culture, and long-term career alignment.',
      keyMetrics: [
        { label: 'Match Accuracy', value: '96%', color: 'green' },
        { label: 'Jobs Analyzed Daily', value: '47K+', color: 'blue' },
        { label: 'Companies Tracked', value: '12,500', color: 'purple' },
        { label: 'Cultural Factors', value: '25+', color: 'orange' }
      ],
      capabilities: [
        'Cultural fit analysis using company data',
        'Growth trajectory alignment scoring',
        'Compensation competitiveness analysis',
        'Remote work compatibility assessment',
        'Team dynamics prediction',
        'Long-term career path alignment'
      ],
      technicalSpecs: [
        'Natural language processing for job descriptions',
        'Company culture sentiment analysis',
        'Multi-dimensional compatibility scoring',
        'Real-time job posting monitoring'
      ]
    },
    {
      icon: TrendingUp,
      category: 'MARKET INTELLIGENCE',
      title: 'Real-Time Market Analysis',
      description: 'Comprehensive market intelligence combining salary data, skill demand trends, and industry forecasts to guide strategic career decisions.',
      keyMetrics: [
        { label: 'Markets Monitored', value: '25+', color: 'green' },
        { label: 'Salary Data Points', value: '15M+', color: 'blue' },
        { label: 'Skills Tracked', value: '2,500+', color: 'purple' },
        { label: 'Trend Accuracy', value: '89%', color: 'orange' }
      ],
      capabilities: [
        'Global salary benchmarking across 25 markets',
        'Skill demand forecasting (6-18 months)',
        'Industry growth trend analysis',
        'Emerging technology impact assessment',
        'Economic indicator correlation',
        'Geographic opportunity mapping'
      ],
      technicalSpecs: [
        'Multi-source data aggregation pipeline',
        'Time-series forecasting models',
        'Economic indicator integration',
        'Hourly market data refresh'
      ]
    },
    {
      icon: Users,
      category: 'NETWORK INTELLIGENCE',
      title: 'Professional Network Analysis',
      description: 'Leverage network effects and professional connections to identify hidden opportunities and optimize career positioning.',
      keyMetrics: [
        { label: 'Professionals Analyzed', value: '2.5M+', color: 'green' },
        { label: 'Network Connections', value: '45M+', color: 'blue' },
        { label: 'Hidden Opportunities', value: '15%', color: 'purple' },
        { label: 'Success Rate', value: '73%', color: 'orange' }
      ],
      capabilities: [
        'LinkedIn network analysis and optimization',
        'Hidden job market opportunity identification',
        'Referral pathway mapping',
        'Industry influencer identification',
        'Professional relationship strength scoring',
        'Network gap analysis and recommendations'
      ],
      technicalSpecs: [
        'Graph neural networks for relationship modeling',
        'Social network analysis algorithms',
        'Privacy-preserving data processing',
        'Cross-platform integration capabilities'
      ]
    },
    {
      icon: BarChart3,
      category: 'SKILLS INTELLIGENCE',
      title: 'Strategic Skills Development',
      description: 'Data-driven skills analysis identifying high-impact learning opportunities and emerging competencies for career advancement.',
      keyMetrics: [
        { label: 'Skills Monitored', value: '2,500+', color: 'green' },
        { label: 'Learning Paths', value: '850+', color: 'blue' },
        { label: 'ROI Prediction', value: '92%', color: 'purple' },
        { label: 'Time to Impact', value: '3-6mo', color: 'orange' }
      ],
      capabilities: [
        'Skills gap analysis with prioritization',
        'Learning ROI prediction modeling',
        'Emerging skills trend identification',
        'Personalized learning pathway creation',
        'Skill obsolescence risk assessment',
        'Certification value analysis'
      ],
      technicalSpecs: [
        'Skills taxonomy with 2,500+ competencies',
        'Demand forecasting with trend analysis',
        'Learning resource recommendation engine',
        'Impact measurement and tracking'
      ]
    },
    {
      icon: Zap,
      category: 'AUTOMATION SUITE',
      title: 'Intelligent Career Automation',
      description: 'Automated career management tools that continuously monitor, analyze, and optimize your professional trajectory.',
      keyMetrics: [
        { label: 'Time Saved', value: '15hrs/week', color: 'green' },
        { label: 'Auto-Updates', value: '24/7', color: 'blue' },
        { label: 'Opportunity Alerts', value: '50+/month', color: 'purple' },
        { label: 'Response Time', value: '<1min', color: 'orange' }
      ],
      capabilities: [
        'Automated job opportunity scanning',
        'Smart notification and alert system',
        'Profile optimization recommendations',
        'Interview scheduling and preparation',
        'Salary negotiation data and scripts',
        'Career milestone tracking and celebration'
      ],
      technicalSpecs: [
        'Real-time job board monitoring',
        'AI-powered notification prioritization',
        'Calendar integration and automation',
        'Multi-channel communication support'
      ]
    }
  ]

  return (
    <section id="features" className="py-32 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 mb-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <Database size={16} />
            Advanced Features
          </div>

          <h2 className="text-5xl md:text-6xl font-light text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Enterprise-grade
            <span className="block font-medium text-blue-600 dark:text-blue-500 mt-2">
              career intelligence
            </span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
            Comprehensive AI-powered tools and analytics that transform how you approach your career.
            <br />Built for professionals who demand precision and strategic insight.
          </p>
        </div>

        {/* Feature navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeFeature === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-sm">{feature.title}</span>
              </button>
            )
          })}
        </div>

        {/* Active feature detailed view */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Content */}
            <div className="p-12">
              <div className="space-y-8">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                      {React.createElement(features[activeFeature].icon, { size: 24 })}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        {features[activeFeature].category}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {features[activeFeature].title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {features[activeFeature].description}
                  </p>
                </div>

                {/* Key metrics */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">Key Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {features[activeFeature].keyMetrics.map((metric, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className={`text-2xl font-bold mb-1 ${
                          metric.color === 'green' ? 'text-green-600' :
                          metric.color === 'blue' ? 'text-blue-600' :
                          metric.color === 'purple' ? 'text-purple-600' :
                          'text-orange-600'
                        }`}>
                          {metric.value}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core capabilities */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">Core Capabilities</h4>
                  <div className="space-y-2">
                    {features[activeFeature].capabilities.map((capability, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span>{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical specifications */}
            <div className="bg-slate-50 dark:bg-slate-900 p-12">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="text-slate-600 dark:text-slate-400" size={20} />
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Technical Specifications</h4>
                  </div>
                  <div className="space-y-4">
                    {features[activeFeature].technicalSpecs.map((spec, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{spec}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration info */}
                <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-blue-600" size={20} />
                    <h5 className="font-semibold text-slate-900 dark:text-white">Integration & Security</h5>
                  </div>
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>SOC 2 Type II compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>GDPR & CCPA compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>99.9% uptime SLA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>Enterprise SSO support</span>
                    </div>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">47,832</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Jobs processed today</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-500">
                    <Clock size={12} />
                    <span>Updated 23 seconds ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature overview grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-12">Complete Feature Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                      <IconComponent size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        {feature.category}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {feature.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {feature.description.substring(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">View Details →</span>
                    <div className="flex gap-1">
                      {feature.keyMetrics.slice(0, 2).map((metric, i) => (
                        <div key={i} className={`px-2 py-1 rounded text-xs font-semibold ${
                          metric.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                          metric.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                          metric.color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                        }`}>
                          {metric.value}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
    }