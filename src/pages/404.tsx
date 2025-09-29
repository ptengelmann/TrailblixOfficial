// src/pages/404.tsx
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-light text-slate-900 dark:text-white mb-4 tracking-tight">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <Home className="h-5 w-5" />
              Go to Dashboard
            </span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="block w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </span>
          </button>
        </div>

        <div className="mt-8 text-sm text-slate-500 dark:text-slate-600">
          <p>Lost? Try going back or return to the dashboard.</p>
        </div>
      </div>
    </div>
  )
}