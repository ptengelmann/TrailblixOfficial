import { useState, useEffect } from 'react'
import { TrendingUp, Brain, Zap, ChevronRight, Sparkles, Target, Clock, TrendingDown, Play, Pause } from 'lucide-react'

export default function DemoSection() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  const demoSteps = [
    {
      title: "Analyzing your profile...",
      subtitle: "AI processes your experience, skills, and career history",
      content: "Senior Software Engineer • 5 years experience • React, Node.js, TypeScript",
      insight: null,
      jobs: null,
      skills: null
    },
    {
      title: "Market intelligence gathered",
      subtitle: "Real-time analysis across global job markets",
      content: "Scanning 47,000+ job postings across UK, US, EU markets",
      insight: null,
      jobs: null,
      skills: null
    },
    {
      title: "AI insight generated",
      subtitle: "Predictive modeling creates personalized forecasts",
      content: null,
      insight: {
        type: "Salary Forecast",
        value: "£95,000 → £125,000",
        timeframe: "Next 18 months",
        confidence: "94% accuracy",
        action: "Add cloud architecture skills"
      },
      jobs: null,
      skills: null
    },
    {
      title: "Strategic job matches found",
      subtitle: "Intelligent matching with career growth analysis",
      content: null,
      insight: null,
      jobs: [
        {
          title: "Staff Engineer",
          company: "Monzo",
          match: "96%",
          salary: "£120-140k",
          growth: "+23%",
          location: "London"
        },
        {
          title: "Principal Developer",
          company: "Revolut",
          match: "91%",
          salary: "£110-130k",
          growth: "+18%",
          location: "Remote"
        },
        {
          title: "Tech Lead",
          company: "Stripe",
          match: "89%",
          salary: "£115-135k",
          growth: "+21%",
          location: "Dublin"
        }
      ],
      skills: null
    },
    {
      title: "Skills trajectory mapped",
      subtitle: "Market trend analysis with learning pathways",
      content: null,
      insight: null,
      jobs: null,
      skills: {
        trending: [
          { name: "Kubernetes", demand: "+47%", timeToLearn: "3 months", priority: "High" },
          { name: "GraphQL", demand: "+31%", timeToLearn: "6 weeks", priority: "Medium" },
          { name: "Rust", demand: "+58%", timeToLearn: "4 months", priority: "High" }
        ],
        declining: [
          { name: "jQuery", demand: "-23%", risk: "Medium" },
          { name: "PHP 7", demand: "-15%", risk: "Low" }
        ]
      }
    }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentStep((step) => (step + 1) % demoSteps.length)
            return 0
          }
          return prev + 2
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, demoSteps.length])

  const currentData = demoSteps[currentStep]

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
    setProgress(0)
    setIsPlaying(false)
    setTimeout(() => setIsPlaying(true), 1000)
  }

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 mb-6 bg-white dark:bg-slate-950">
            <Brain size={16} />
            Live Demo
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-white tracking-tight mb-4">
            Watch AI career intelligence
            <span className="block font-medium text-blue-600 dark:text-blue-500">in action</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See how our AI analyzes your profile, forecasts market trends, and delivers strategic career insights in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Demo interface */}
          <div className="relative">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              {/* Demo header with controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse animation-delay-200" />
                    <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse animation-delay-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    AI Processing
                  </span>
                </div>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {isPlaying ? 
                    <Pause className="w-4 h-4 text-slate-600 dark:text-slate-400" /> : 
                    <Play className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  }
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Demo content area */}
              <div className="min-h-[400px]">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {currentData.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  {currentData.subtitle}
                </p>

                {/* Profile analysis */}
                {currentData.content && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                      {currentData.content}
                    </p>
                  </div>
                )}

                {/* AI Insights */}
                {currentData.insight && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                        {currentData.insight.type}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-semibold text-slate-900 dark:text-white">
                          {currentData.insight.value}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full font-medium">
                          {currentData.insight.confidence}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {currentData.insight.timeframe}
                      </p>
                      
                      <div className="flex items-center gap-2 pt-3 border-t border-blue-200 dark:border-blue-800">
                        <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                        <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                          {currentData.insight.action}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job matches */}
                {currentData.jobs && (
                  <div className="space-y-4">
                    {currentData.jobs.map((job, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-slate-900 dark:text-white">{job.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{job.company} • {job.location}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400">
                              <Target className="w-3 h-3" />
                              {job.match}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{job.salary}</span>
                          <span className="text-green-600 dark:text-green-500">Career growth: {job.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills analysis */}
                {currentData.skills && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                          High Growth Skills
                        </span>
                      </div>
                      <div className="space-y-3">
                        {currentData.skills.trending.map((skill, index) => (
                          <div key={index} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">{skill.name}</span>
                              <span className="text-xs text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                                {skill.priority} Priority
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-600 dark:text-green-500 font-medium">Demand: +{skill.demand}</span>
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <Clock className="w-3 h-3" />
                                {skill.timeToLearn}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                          Declining Demand
                        </span>
                      </div>
                      <div className="space-y-2">
                        {currentData.skills.declining.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{skill.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-orange-600 dark:text-orange-500">{skill.demand}</span>
                              <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                                {skill.risk} Risk
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step indicators & info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                How it works
              </h3>
              <div className="space-y-4">
                {demoSteps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      index === currentStep
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          index === currentStep
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {step.title}
                        </h4>
                        <p className={`text-xs ${
                          index === currentStep
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Key benefits */}
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Why this matters
              </h4>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p><strong>Predictive accuracy:</strong> Our AI forecasts career moves with 94% accuracy using real market data</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p><strong>Strategic timing:</strong> Know exactly when to make your next career move for maximum impact</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p><strong>Skills intelligence:</strong> Stay ahead of market trends with predictive skills analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}