import Link from 'next/link'
import { ArrowRight, TrendingUp, Brain, Zap, ChevronRight, Sparkles, Target, Clock, TrendingDown } from 'lucide-react'
import { useState, useEffect } from 'react'

function AICareerDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  const demoSteps = [
    {
      title: "Analyzing your profile...",
      content: "Senior Software Engineer • 5 years experience • React, Node.js, TypeScript",
      insight: null,
      jobs: null,
      skills: null
    },
    {
      title: "Market intelligence gathered",
      content: "Scanning 47,000+ job postings across UK, US, EU markets",
      insight: null,
      jobs: null,
      skills: null
    },
    {
      title: "AI insight generated",
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
      content: null,
      insight: null,
      jobs: [
        {
          title: "Staff Engineer",
          company: "Monzo",
          match: "96%",
          salary: "£120-140k",
          growth: "+23%"
        },
        {
          title: "Principal Developer",
          company: "Revolut",
          match: "91%",
          salary: "£110-130k",
          growth: "+18%"
        }
      ],
      skills: null
    },
    {
      title: "Skills trajectory mapped",
      content: null,
      insight: null,
      jobs: null,
      skills: {
        trending: [
          { name: "Kubernetes", demand: "+47%", timeToLearn: "3 months" },
          { name: "GraphQL", demand: "+31%", timeToLearn: "6 weeks" },
          { name: "Rust", demand: "+58%", timeToLearn: "4 months" }
        ],
        declining: [
          { name: "jQuery", demand: "-23%" },
          { name: "PHP 7", demand: "-15%" }
        ]
      }
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTyping(true)
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length)
        setIsTyping(false)
      }, 500)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const currentData = demoSteps[currentStep]

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      {/* Demo header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200" />
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse animation-delay-400" />
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {currentData.title}
        </span>
      </div>

      {/* Demo content */}
      {currentData.content && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
            {currentData.content}
          </p>
        </div>
      )}

      {/* AI Insight */}
      {currentData.insight && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              {currentData.insight.type}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {currentData.insight.value}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                {currentData.insight.confidence}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {currentData.insight.timeframe}
            </p>
            
            <div className="flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <ChevronRight className="w-3 h-3 text-blue-600 dark:text-blue-500" />
              <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                {currentData.insight.action}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Strategic job matches */}
      {currentData.jobs && (
        <div className="space-y-3">
          {currentData.jobs.map((job, index) => (
            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">{job.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{job.company}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-400">
                    <Target className="w-3 h-3" />
                    {job.match}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{job.salary}</span>
                <span className="text-green-600 dark:text-green-500">Career growth: {job.growth}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills trajectory */}
      {currentData.skills && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                High Growth Skills
              </span>
            </div>
            <div className="space-y-2">
              {currentData.skills.trending.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{skill.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-600 dark:text-green-500">+{skill.demand}</span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        {skill.timeToLearn}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                Declining Demand
              </span>
            </div>
            <div className="space-y-1">
              {currentData.skills.declining.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{skill.name}</span>
                  <span className="text-xs text-orange-600 dark:text-orange-500">{skill.demand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Demo indicator */}
      <div className="flex justify-center mt-4 space-x-1">
        {demoSteps.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentStep 
                ? 'bg-blue-600 dark:bg-blue-500' 
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950">
      {/* Minimal geometric background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-600 rounded-full opacity-60" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-600 rounded-full opacity-40" />
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-blue-600 rounded-full opacity-50" />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-blue-600 rounded-full opacity-30" />
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/5 to-transparent dark:via-blue-950/10" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-20">
        {/* Premium badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 mb-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <Brain size={16} />
          AI Career Intelligence
        </div>
        
        {/* Sharp, confident headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 dark:text-white tracking-tight leading-[0.9] mb-6">
          Career intelligence
          <span className="block font-medium text-blue-600 dark:text-blue-500">
            that actually works
          </span>
        </h1>
        
        {/* Strategic value proposition */}
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-4">
          AI that forecasts market trends, predicts salary trajectories, and maps optimal career paths.
        </p>
        
        <p className="max-w-2xl mx-auto text-base text-slate-500 dark:text-slate-500 mb-12">
          Multi-dimensional intelligence for strategic career decisions.
        </p>
        
        {/* Clean CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Start intelligence analysis
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#capabilities"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
          >
            View capabilities
            <TrendingUp size={16} />
          </Link>
        </div>
        
        {/* Interactive demo */}
        <AICareerDemo />
        
        {/* Enterprise trust indicators */}
        <div className="mt-16 flex items-center justify-center gap-8 text-xs text-slate-400 dark:text-slate-600 font-medium">
          <span>Enterprise-grade AI</span>
          <span>•</span>
          <span>Real-time market data</span>
          <span>•</span>
          <span>Predictive accuracy</span>
        </div>
      </div>
    </section>
  )
}