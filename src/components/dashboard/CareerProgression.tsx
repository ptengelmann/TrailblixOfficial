// Career Progression System with Feature Unlocks
// Shows meaningful progression with real rewards and feature unlocks

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  Trophy, Zap, Lock, Unlock, TrendingUp, Sparkles,
  Target, Award, Crown, Loader2
} from 'lucide-react'
import Link from 'next/link'

interface LevelSystem {
  current_level: number
  total_xp: number
  xp_to_next_level: number
  unlocked_features: string[]
  next_unlock: {
    feature: string
    at_level: number
    xp_required: number
  }
}

export default function CareerProgression() {
  const { user } = useAuth()
  const [levelSystem, setLevelSystem] = useState<LevelSystem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProgression()
    }
  }, [user])

  const loadProgression = async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/dashboard/unified-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setLevelSystem(result.data.level_system)

        logger.info('Progression loaded', 'COMPONENT', {
          level: result.data.level_system.current_level,
          xp: result.data.level_system.total_xp
        })
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to load progression', 'COMPONENT', { error: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!levelSystem) return null

  const progressPercentage = ((levelSystem.total_xp % 100) / 100) * 100
  const isMaxLevel = levelSystem.next_unlock.xp_required === 0

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            {isMaxLevel ? (
              <Crown className="text-yellow-300" size={24} />
            ) : (
              <Trophy className="text-white" size={24} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Level {levelSystem.current_level}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {levelSystem.total_xp} XP Total
            </p>
          </div>
        </div>

        <Link
          href="/intelligence"
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Sparkles size={14} />
          View Intelligence
        </Link>
      </div>

      {/* XP Progress Bar */}
      {!isMaxLevel && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress to Level {levelSystem.current_level + 1}
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {levelSystem.xp_to_next_level} XP needed
            </span>
          </div>
          <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      )}

      {/* Unlocked Features */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Unlock size={16} className="text-green-600" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Unlocked Features ({levelSystem.unlocked_features.length})
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {levelSystem.unlocked_features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award size={16} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Unlock */}
      {!isMaxLevel && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  Next Unlock
                </h4>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                  LEVEL {levelSystem.next_unlock.at_level}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {levelSystem.next_unlock.feature}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Target size={12} />
                <span className="font-medium">
                  {levelSystem.next_unlock.xp_required} XP away
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Max Level Achievement */}
      {isMaxLevel && (
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center">
          <Crown className="mx-auto mb-2 text-yellow-600" size={32} />
          <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">
            Maximum Level Achieved!
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            You&apos;ve unlocked all features. Keep earning XP to maintain your streak!
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Zap size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong>Tip:</strong> Complete daily AI tasks and take career actions to earn XP and unlock advanced features
          </p>
        </div>
      </div>
    </div>
  )
}
