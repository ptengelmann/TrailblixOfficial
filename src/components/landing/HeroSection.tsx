import Link from 'next/link'
import { ArrowRight, TrendingUp, Brain } from 'lucide-react'

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
            href="#features"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
          >
            View capabilities
            <TrendingUp size={16} />
          </Link>
        </div>
        
        {/* Enterprise trust indicators */}
        <div className="flex items-center justify-center gap-8 text-xs text-slate-400 dark:text-slate-600 font-medium">
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