import Link from 'next/link'
import { ArrowRight, Brain, BarChart3, Target, TrendingUp, Users, Clock, CheckCircle, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HeroSection() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [liveMetrics, setLiveMetrics] = useState({
    jobsAnalyzed: 47832,
    accuracy: 94,
    avgIncrease: 127
  })

  const demos = [
    {
      title: "Market Intelligence",
      description: "Real-time analysis of 47K+ jobs daily",
      visual: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Software Engineer - London</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-slate-600 dark:text-slate-400">Market demand:</span> <span className="font-semibold text-green-600">High</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Salary range:</span> <span className="font-semibold">£80-120k</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Growth:</span> <span className="font-semibold text-blue-600">+23%</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Openings:</span> <span className="font-semibold">1,247</span></div>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">AI/ML Engineer - Remote</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-slate-600 dark:text-slate-400">Market demand:</span> <span className="font-semibold text-red-600">Critical</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Salary range:</span> <span className="font-semibold">£100-180k</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Growth:</span> <span className="font-semibold text-blue-600">+67%</span></div>
              <div><span className="text-slate-600 dark:text-slate-400">Openings:</span> <span className="font-semibold">3,891</span></div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Career Trajectory",
      description: "AI predicts your 18-month path",
      visual: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div><div className="font-semibold text-sm">Current</div><div className="text-xs text-slate-600 dark:text-slate-400">Mid-level Developer</div></div>
            <div className="text-right"><div className="font-bold text-green-600">£75,000</div></div>
          </div>
          <div className="flex items-center justify-center"><ArrowRight className="text-blue-600 animate-pulse" size={20} /></div>
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div><div className="font-semibold text-sm">Projected (14 months)</div><div className="text-xs text-blue-600 dark:text-blue-400">Senior Engineer</div></div>
            <div className="text-right"><div className="font-bold text-green-600">£125,000</div><div className="text-xs text-green-600">+67% increase</div></div>
          </div>
          <div className="text-center text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded">89% probability • Based on 12.3K similar profiles</div>
        </div>
      )
    },
    {
      title: "Skills Gap Analysis",
      description: "Identify what skills to learn next",
      visual: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Skills for Senior Engineer Role</div>
          {[
            { skill: "Kubernetes", status: "Missing", priority: "Critical", color: "red" },
            { skill: "System Design", status: "Basic", priority: "Important", color: "orange" },
            { skill: "React", status: "Strong", priority: "Have", color: "green" },
            { skill: "TypeScript", status: "Strong", priority: "Have", color: "green" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded">
              <span className="font-medium">{item.skill}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                item.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                item.color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' :
                'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
              }`}>{item.priority}</span>
            </div>
          ))}
        </div>
      )
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % demos.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        jobsAnalyzed: prev.jobsAnalyzed + Math.floor(Math.random() * 3) + 1,
        accuracy: 94 + Math.floor(Math.random() * 2),
        avgIncrease: 127 + Math.floor(Math.random() * 6) - 3
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-slate-950">
      {/* Subtle background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Live metrics badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 dark:text-green-300 text-sm font-semibold">Live Intelligence</span>
              <span className="text-slate-600 dark:text-slate-400 text-sm">
                {liveMetrics.jobsAnalyzed.toLocaleString()} jobs analyzed today
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-5xl md:text-6xl font-light text-slate-900 dark:text-white leading-tight mb-6">
                AI-powered career intelligence
                <span className="block font-semibold text-blue-600 dark:text-blue-500">
                  for strategic decisions
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-8">
                TrailBlix analyzes millions of job postings, salary data, and career paths to predict market trends, forecast your earning potential, and identify the exact skills you need for your next career move.
              </p>
            </div>

            {/* Key features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: BarChart3, title: "Market Analysis", desc: "47K+ jobs analyzed daily" },
                { icon: Target, title: "Precision Matching", desc: "94% prediction accuracy" },
                { icon: TrendingUp, title: "Salary Forecasting", desc: "18-month projections" },
                { icon: Users, title: "Career Paths", desc: "12.3K professional profiles" }
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{feature.title}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
              >
                <Sparkles size={18} />
                Start Free Analysis
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/10 transition-colors"
              >
                <Brain size={18} />
                See How It Works
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle size={16} className="text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock size={16} className="text-blue-500" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users size={16} className="text-indigo-500" />
                <span>Used by 50K+ professionals</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Demo */}
          <div className="space-y-6">
            {/* Demo tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {demos.map((demo, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDemo(i)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeDemo === i
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {demo.title}
                </button>
              ))}
            </div>

            {/* Demo content */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{demos[activeDemo].title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{demos[activeDemo].description}</div>
                </div>
              </div>

              <div className="min-h-[280px]">
                {demos[activeDemo].visual}
              </div>
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{liveMetrics.accuracy}%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Prediction accuracy</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">+{liveMetrics.avgIncrease}%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Avg salary increase</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">15s</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Analysis time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}