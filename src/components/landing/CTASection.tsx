// src/components/landing/CTASection.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-white dark:text-slate-900">
            Ready to take control?
          </h2>
          <p className="mt-4 text-lg text-slate-300 dark:text-slate-600 font-light">
            Get AI-powered career intelligence in minutes
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Start your free analysis
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">
            No credit card required • 5-minute setup • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}