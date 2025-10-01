// Professional Career Timeline Visualization
// Clean horizontal timeline with milestone markers

import { MapPin, Briefcase, Target, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface CareerTimelineProps {
  currentRole: string
  targetRole: string
  mostLikelyNext: string
  timeline: string
  probability: number
  alternativePaths?: Array<{
    role: string
    difficulty: string
    timeline: string
  }>
  salaryData?: {
    target_role_range: {
      min: number
      median: number
      max: number
    }
    potential_increase: {
      amount: number
      percentage: number
    }
  }
}

export default function CareerTimelineView({
  currentRole,
  targetRole,
  mostLikelyNext,
  timeline,
  probability,
  alternativePaths = [],
  salaryData
}: CareerTimelineProps) {

  const milestones = [
    {
      title: currentRole,
      subtitle: 'Current Position',
      status: 'current',
      icon: Briefcase,
      color: 'blue',
      salary: salaryData ? `$${(salaryData.target_role_range.min / 1000).toFixed(0)}K` : null,
      time: 'Now'
    },
    {
      title: mostLikelyNext,
      subtitle: 'Next Step',
      status: 'next',
      icon: TrendingUp,
      color: 'purple',
      salary: salaryData ? `$${(salaryData.target_role_range.median / 1000).toFixed(0)}K` : null,
      time: '12-18 months',
      probability: 75
    },
    {
      title: targetRole,
      subtitle: 'Target Role',
      status: 'target',
      icon: Target,
      color: 'green',
      salary: salaryData ? `$${(salaryData.target_role_range.max / 1000).toFixed(0)}K` : null,
      time: timeline || '2-3 years',
      probability
    }
  ]

  const getColorClasses = (color: string, variant: 'bg' | 'border' | 'text' | 'ring') => {
    const colors = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-950/30',
        border: 'border-blue-500',
        text: 'text-blue-600',
        ring: 'ring-blue-500/20'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-950/30',
        border: 'border-purple-500',
        text: 'text-purple-600',
        ring: 'ring-purple-500/20'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-950/30',
        border: 'border-green-500',
        text: 'text-green-600',
        ring: 'ring-green-500/20'
      }
    }
    return colors[color as keyof typeof colors][variant]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Career Path</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Projected timeline to reach your target role
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp size={20} />
              <span className="text-2xl font-bold">{probability}%</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-20"></div>

          {/* Milestones */}
          <div className="relative grid grid-cols-3 gap-8">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon
              return (
                <div key={index} className="relative flex flex-col items-center">
                  {/* Connector Line (animated) */}
                  {index < milestones.length - 1 && (
                    <div className="absolute top-24 left-1/2 w-full h-0.5 z-0">
                      <div className={`h-full bg-gradient-to-r from-${milestone.color}-500 to-transparent`}></div>
                    </div>
                  )}

                  {/* Card */}
                  <div className={`
                    relative z-10 w-full p-6 rounded-xl border-2
                    ${milestone.status === 'current'
                      ? `${getColorClasses(milestone.color, 'border')} ${getColorClasses(milestone.color, 'bg')} ring-4 ${getColorClasses(milestone.color, 'ring')}`
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500'
                    }
                    transition-all duration-300 hover:shadow-lg group
                  `}>
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
                      ${getColorClasses(milestone.color, 'bg')}
                      ${milestone.status === 'current' ? 'ring-4 ring-white dark:ring-slate-900' : ''}
                      group-hover:scale-110 transition-transform duration-200
                    `}>
                      <Icon className={getColorClasses(milestone.color, 'text')} size={24} />
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-2">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {milestone.subtitle}
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {milestone.title}
                      </h4>

                      {/* Time & Salary */}
                      <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Clock size={12} />
                          <span>{milestone.time}</span>
                        </div>
                        {milestone.salary && (
                          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                            <DollarSign size={12} />
                            <span>{milestone.salary}</span>
                          </div>
                        )}
                        {milestone.probability && (
                          <div className="mt-2">
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {milestone.probability}% likely
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Current Indicator */}
                    {milestone.status === 'current' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                          YOU ARE HERE
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <Clock className="mx-auto mb-2 text-blue-600" size={20} />
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Timeline</div>
            <div className="font-semibold text-slate-900 dark:text-white">{timeline || '2-3 years'}</div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <TrendingUp className="mx-auto mb-2 text-green-600" size={20} />
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Salary Growth</div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {salaryData ? `+$${(salaryData.potential_increase.amount / 1000).toFixed(0)}K` : 'N/A'}
            </div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <Target className="mx-auto mb-2 text-purple-600" size={20} />
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Success Rate</div>
            <div className="font-semibold text-slate-900 dark:text-white">{probability}%</div>
          </div>
        </div>
      </div>

      {/* Alternative Paths */}
      {alternativePaths.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-slate-600" size={20} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Alternative Paths</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alternativePaths.map((path, i) => (
              <div
                key={i}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">{path.role}</h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    path.difficulty === 'easier' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    path.difficulty === 'similar' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {path.difficulty}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Timeline: {path.timeline}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
