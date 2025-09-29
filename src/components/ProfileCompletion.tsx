// src/components/ProfileCompletion.tsx - Updated routing
import { CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'
import { UserProfile, CareerObjectives } from '@/types/api'

interface ProfileCompletionProps {
  profile: UserProfile | null
  careerGoals: CareerObjectives | null
  hasResume: boolean
}

export default function ProfileCompletion({ profile, careerGoals, hasResume }: ProfileCompletionProps) {
  const steps = [
    {
      name: 'Basic Profile',
      completed: profile?.full_name && profile?.current_role,
      href: '/profile'  // Updated to use unified page
    },
    {
      name: 'Career Goals', 
      completed: careerGoals?.target_role,
      href: '/profile'  // Updated to use unified page
    },
    {
      name: 'Resume Upload',
      completed: hasResume,
      href: '/resume-analyzer'
    },
  ]

  const completedSteps = steps.filter(s => s.completed).length
  const totalSteps = steps.length
  const percentage = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Profile Completion</h3>
        <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/30 rounded-full h-2 mb-6">
        <div 
          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Link
            key={index}
            href={step.href}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-slate-500" />
              )}
              <span className={step.completed ? 'text-white' : 'text-slate-400'}>
                {step.name}
              </span>
            </div>
            <span className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}