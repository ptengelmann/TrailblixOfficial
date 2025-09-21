// src/components/EmptyState.tsx
// Reusable empty state component for when users have no data

import { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="text-slate-400">{icon}</div>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-slate-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-indigo-600 transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-indigo-600 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  )
}