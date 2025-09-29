import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle, Clock, Users } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        {/* Main headline */}
        <h2 className="text-5xl md:text-6xl font-light text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          Ready to advance
          <span className="block font-medium text-blue-600 dark:text-blue-500 mt-2">
            your career?
          </span>
        </h2>

        <p className="text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
          Get AI-powered career intelligence and personalized insights in under 5 minutes.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
          >
            <Sparkles size={18} />
            Start Free Analysis
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <span>5-minute setup</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            <span>50K+ professionals</span>
          </div>
        </div>
      </div>
    </section>
  )
}