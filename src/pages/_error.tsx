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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            {statusCode || 'Error'}
          </h1>
          
          <h2 className="text-xl font-semibold text-white mb-2">
            {errorTitle}
          </h2>
          
          <p className="text-slate-400 mb-6">
            {errorMessage}
          </p>

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
              onClick={() => window.location.reload()}
              className="block w-full py-3 px-4 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition-all"
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