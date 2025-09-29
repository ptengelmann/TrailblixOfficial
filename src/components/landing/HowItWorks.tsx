import { Upload, Brain, Target, ArrowRight, CheckCircle, Play, Timer, BarChart3, Users, TrendingUp, Zap, FileText, Search, Lightbulb, Star } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorks() {

  const steps = [
    {
      number: 1,
      title: 'Profile Analysis',
      duration: '30 seconds',
      icon: Upload,
      description: 'Upload your CV or connect LinkedIn. Our AI extracts and analyzes your complete professional profile.',
      details: {
        process: [
          'Skills extraction (24+ identified)',
          'Experience timeline mapping',
          'Achievement quantification',
          'Industry context analysis'
        ],
        output: {
          title: 'Profile Intelligence Report',
          metrics: [
            { label: 'Skills Identified', value: '24', color: 'blue' },
            { label: 'Years Experience', value: '5.2', color: 'green' },
            { label: 'Career Level', value: 'Mid-Senior', color: 'purple' },
            { label: 'Industry Match', value: '94%', color: 'orange' }
          ]
        }
      },
      visual: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
            <FileText className="text-blue-600" size={20} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-slate-900 dark:text-white">CV_John_Smith.pdf</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Processing... 87% complete</div>
            </div>
            <div className="text-sm font-bold text-blue-600">24 skills found</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded text-center">
              <div className="font-bold text-lg text-blue-600">5.2</div>
              <div className="text-slate-600 dark:text-slate-400">Years Experience</div>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded text-center">
              <div className="font-bold text-lg text-purple-600">94%</div>
              <div className="text-slate-600 dark:text-slate-400">Industry Match</div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: 'Market Intelligence',
      duration: '15 seconds',
      icon: Brain,
      description: 'AI analyzes 47K+ global job postings, salary data, and industry trends to understand market dynamics.',
      details: {
        process: [
          'Real-time job market scanning',
          'Salary benchmark analysis',
          'Skill demand forecasting',
          'Competition assessment'
        ],
        output: {
          title: 'Market Position Analysis',
          metrics: [
            { label: 'Market Demand', value: 'High', color: 'green' },
            { label: 'Salary Percentile', value: '75th', color: 'blue' },
            { label: 'Competition Level', value: 'Medium', color: 'orange' },
            { label: 'Growth Potential', value: '+67%', color: 'purple' }
          ]
        }
      },
      visual: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border">
            <Search className="text-green-600" size={16} />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white">Scanning global markets...</div>
              <div className="text-slate-600 dark:text-slate-400">47,832 jobs analyzed in real-time</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
              <span>London Market</span><span className="font-semibold text-green-600">1,247 openings</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
              <span>Remote Roles</span><span className="font-semibold text-blue-600">3,891 openings</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
              <span>Salary Range</span><span className="font-semibold text-purple-600">£80-140k</span>
            </div>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: 'Strategic Roadmap',
      duration: '45 seconds',
      icon: Target,
      description: 'Generate personalized career strategy with specific actions, timelines, and success probabilities.',
      details: {
        process: [
          'Goal-oriented path planning',
          'Skill gap identification',
          'Timeline optimization',
          'Risk-reward analysis'
        ],
        output: {
          title: 'Career Strategy Blueprint',
          metrics: [
            { label: 'Success Probability', value: '89%', color: 'green' },
            { label: 'Timeline', value: '14 mo', color: 'blue' },
            { label: 'Salary Increase', value: '+67%', color: 'purple' },
            { label: 'Skills to Learn', value: '3', color: 'orange' }
          ]
        }
      },
      visual: (
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="text-yellow-600" size={16} />
              <div className="font-semibold text-sm text-slate-900 dark:text-white">Strategic Recommendation</div>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300">Learn Kubernetes → Apply to Senior roles → 89% success rate</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
              <span>Next Role: Senior Engineer</span>
              <span className="text-green-600 font-semibold">£125k target</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
              <span>Timeline: 14 months</span>
              <span className="text-blue-600 font-semibold">89% probability</span>
            </div>
          </div>
        </div>
      )
    },
    {
      number: 4,
      title: 'Intelligent Matching',
      duration: 'Real-time',
      icon: Users,
      description: 'Continuous job matching with AI-powered compatibility scoring beyond keywords.',
      details: {
        process: [
          'Cultural fit analysis',
          'Growth trajectory matching',
          'Compensation benchmarking',
          'Company intelligence research'
        ],
        output: {
          title: 'Smart Job Matches',
          metrics: [
            { label: 'Match Score', value: '96%', color: 'green' },
            { label: 'Culture Fit', value: 'High', color: 'blue' },
            { label: 'Growth Potential', value: '+23%', color: 'purple' },
            { label: 'New Matches', value: '12/day', color: 'orange' }
          ]
        }
      },
      visual: (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm text-slate-900 dark:text-white">Staff Engineer - Monzo</div>
              <div className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold">96% match</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-600 dark:text-slate-400">Salary:</span> <span className="font-semibold">£120-140k</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Culture:</span> <span className="font-semibold text-green-600">Perfect fit</span></div>
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm text-slate-900 dark:text-white">Principal Dev - Stripe</div>
              <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">91% match</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-600 dark:text-slate-400">Salary:</span> <span className="font-semibold">£115-135k</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Growth:</span> <span className="font-semibold text-blue-600">+21%</span></div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <section id="how-it-works" className="py-32 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 mb-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <Play size={16} />
            Detailed Process
          </div>

          <h2 className="text-5xl md:text-6xl font-light text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            From profile to
            <span className="block font-medium text-blue-600 dark:text-blue-500 mt-2">
              strategic intelligence
            </span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
            Our 4-step AI process transforms your career data into actionable intelligence.
            <br />Each step builds comprehensive insights for strategic career decisions.
          </p>
        </div>

        {/* Detailed process steps */}
        <div className="space-y-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">STEP {step.number}</span>
                        <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                          <Timer size={12} />
                          {step.duration}
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                    </div>
                  </div>

                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Process details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">Process Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.details.process.map((detail, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Output metrics */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">{step.details.output.title}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {step.details.output.metrics.map((metric, i) => (
                          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className={`text-2xl font-bold mb-1 ${
                              metric.color === 'blue' ? 'text-blue-600' :
                              metric.color === 'green' ? 'text-green-600' :
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
                  </div>
                </div>

                {/* Visual demonstration */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Live Demo</span>
                    </div>
                    <div className="min-h-[280px]">
                      {step.visual}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Results summary */}
        <div className="mt-24 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-12 border border-blue-200 dark:border-blue-800">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Complete Career Intelligence Platform</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get comprehensive career analysis, strategic recommendations, and continuous job matching—all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Timer, label: 'Analysis Time', value: '< 2 min', color: 'blue' },
              { icon: BarChart3, label: 'Accuracy Rate', value: '94%', color: 'green' },
              { icon: TrendingUp, label: 'Avg. Salary Increase', value: '+67%', color: 'purple' },
              { icon: Star, label: 'Success Stories', value: '12.3K+', color: 'orange' }
            ].map((stat, i) => {
              const IconComponent = stat.icon
              return (
                <div key={i} className="text-center p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-950/50 text-green-600' :
                    stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-600' :
                    'bg-orange-100 dark:bg-orange-950/50 text-orange-600'
                  }`}>
                    <IconComponent size={20} />
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <Zap size={20} />
              Start Your Career Analysis
              <ArrowRight size={20} />
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
              Free analysis • No credit card required • 5-minute setup
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}