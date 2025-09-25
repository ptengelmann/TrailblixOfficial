import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-32 bg-gradient-to-b from-slate-900 to-blue-950 dark:from-slate-100 dark:to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        {/* Main headline */}
        <h2 className="text-4xl md:text-5xl font-light text-white dark:text-slate-900 tracking-tight mb-6">
          Ready to make your
          <span className="block font-medium text-blue-400 dark:text-blue-600">
            next career move?
          </span>
        </h2>
        
        <p className="text-lg text-slate-300 dark:text-slate-600 max-w-2xl mx-auto mb-12">
          Get AI-powered career intelligence in under 5 minutes
        </p>
        
        {/* Simple CTA */}
        <div className="mb-8">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            Start free analysis
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Simple trust line */}
        <p className="text-sm text-slate-400 dark:text-slate-600">
          No credit card required • 5-minute setup • Cancel anytime
        </p>
      </div>
    </section>
  )
}