// src/pages/_error.tsx
import { NextPageContext } from 'next'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface ErrorProps {
  statusCode?: number
  title?: string
}

function Error({ statusCode, title }: ErrorProps) {
  const errorTitle = title || (statusCode === 404 ? 'Page Not Found' : 'An Error Occurred')
  const errorMessage = statusCode === 404 
    ? "Sorry, we couldn't find the page you're looking for."
    : statusCode
    ? `A ${statusCode} error occurred on the server.`
    : 'An error occurred on the client.'

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
          
          <h1 className="text-4xl font-light text-slate-900 dark:text-white mb-2 tracking-tight">
            {statusCode || 'Error'}
          </h1>
          
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {errorTitle}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {errorMessage}
          </p>

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
              onClick={() => window.location.reload()}
              className="block w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Try Again
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error