// src/pages/404.tsx
import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white mt-4 mb-2">
            Page Not Found
          </h2>
          <p className="text-slate-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg font-medium hover:from-violet-600 hover:to-indigo-600 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <Home className="h-5 w-5" />
              Go to Dashboard
            </span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="block w-full py-3 px-4 bg-slate-800/40 border border-slate-700/50 rounded-lg font-medium hover:bg-slate-800 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </span>
          </button>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>Lost? Try searching or return to the home page.</p>
        </div>
      </div>
    </div>
  )
}