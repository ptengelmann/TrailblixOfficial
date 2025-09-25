// src/components/LoadingSkeleton.tsx
// Enhanced loading skeletons for different page types

interface LoadingSkeletonProps {
  variant?: 'dashboard' | 'profile' | 'resume' | 'default'
}

export default function LoadingSkeleton({ variant = 'default' }: LoadingSkeletonProps) {
  if (variant === 'dashboard') {
    return (
      <div className="animate-pulse space-y-6">
        {/* Welcome Banner */}
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="lg:col-span-2 h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
        
        {/* Quick Actions */}
        <div>
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className="animate-pulse space-y-6">
        {/* Header */}
        <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        
        {/* Form Fields */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
          <div className="h-12 bg-blue-200 dark:bg-blue-900/50 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (variant === 'resume') {
    return (
      <div className="animate-pulse space-y-8">
        {/* Header */}
        <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        
        {/* Upload Card */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
          <div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
          <div className="h-12 bg-blue-200 dark:bg-blue-900/50 rounded-lg"></div>
        </div>
        
        {/* Analysis Results Placeholder */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="h-16 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-2"></div>
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-slate-100 dark:bg-slate-600 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default skeleton
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    </div>
  )
}