// src/components/NetworkingTracker.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Users, MessageCircle, Coffee, Briefcase, Plus, CheckCircle, Calendar, Trash2 } from 'lucide-react'

interface NetworkingActivity {
  id: string
  type: string
  description: string
  count: number
  created_at: string
}

export default function NetworkingTracker() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<NetworkingActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [newActivity, setNewActivity] = useState({
    type: 'linkedin_message',
    description: '',
    count: 1
  })

  const activityTypes = [
    { key: 'linkedin_message', label: 'LinkedIn Message', icon: MessageCircle, color: 'blue' },
    { key: 'coffee_chat', label: 'Coffee Chat', icon: Coffee, color: 'green' },
    { key: 'referral_request', label: 'Referral Request', icon: Users, color: 'purple' },
    { key: 'job_interview', label: 'Job Interview', icon: Briefcase, color: 'orange' },
    { key: 'industry_event', label: 'Industry Event', icon: Calendar, color: 'indigo' },
    { key: 'other', label: 'Other Networking', icon: Users, color: 'gray' }
  ]

  useEffect(() => {
    if (user) {
      loadActivities()
    }
  }, [user])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user?.id)
        .eq('activity_type', 'networking_activity')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedActivities = (data || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_data?.networking_type || 'other',
        description: activity.activity_data?.description || 'Networking activity',
        count: activity.activity_data?.count || 1,
        created_at: activity.created_at
      }))

      setActivities(formattedActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const addActivity = async () => {
    if (!newActivity.description.trim()) return

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/career-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'track_activity',
          activity_type: 'networking_activity',
          activity_data: {
            networking_type: newActivity.type,
            description: newActivity.description,
            count: newActivity.count
          }
        })
      })

      if (response.ok) {
        // Add to local state
        const newActivityRecord: NetworkingActivity = {
          id: Date.now().toString(),
          type: newActivity.type,
          description: newActivity.description,
          count: newActivity.count,
          created_at: new Date().toISOString()
        }
        
        setActivities(prev => [newActivityRecord, ...prev])
        
        // Reset form
        setNewActivity({
          type: 'linkedin_message',
          description: '',
          count: 1
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding activity:', error)
    } finally {
      setSaving(false)
    }
  }

  const getActivityTypeInfo = (type: string) => {
    return activityTypes.find(t => t.key === type) || activityTypes[activityTypes.length - 1]
  }

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400',
      green: 'text-green-600 bg-green-100 dark:bg-green-950/50 dark:text-green-400',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-950/50 dark:text-purple-400',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400',
      indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400',
      gray: 'text-gray-600 bg-gray-100 dark:bg-gray-950/50 dark:text-gray-400'
    }
    return colors[color] || colors.gray
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="text-blue-600 dark:text-blue-500" size={20} />
          Networking Activities
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Activity
        </button>
      </div>

      {/* Add Activity Form */}
      {showAddForm && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Activity Type
              </label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activityTypes.map(type => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Description
              </label>
              <input
                type="text"
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Messaged 3 product managers about referrals"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Count
              </label>
              <input
                type="number"
                min="1"
                value={newActivity.count}
                onChange={(e) => setNewActivity(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={addActivity}
                disabled={saving || !newActivity.description.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                {saving ? 'Saving...' : 'Save Activity'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
              No networking activities yet
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Start tracking your networking efforts to monitor your progress
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const typeInfo = getActivityTypeInfo(activity.type)
            const Icon = typeInfo.icon
            
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(typeInfo.color)}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span>{typeInfo.label}</span>
                      {activity.count > 1 && (
                        <span>• {activity.count} contacts</span>
                      )}
                      <span>• {new Date(activity.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Weekly Summary */}
      {activities.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {activities.filter(a => {
                  const activityDate = new Date(a.created_at)
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return activityDate >= weekAgo
                }).length}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">This Week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                {activities.reduce((sum, a) => {
                  const activityDate = new Date(a.created_at)
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return activityDate >= weekAgo ? sum + a.count : sum
                }, 0)}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total Contacts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}