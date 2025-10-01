// Professional Salary Analysis with Modern Charts
// Clean, gradient-based visualizations

import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DollarSign, TrendingUp, Award, MapPin, Lightbulb, Target } from 'lucide-react'

interface SalaryAnalysisProps {
  currentSalary?: number
  targetRole: string
  location: string
  experienceLevel: string
  salaryRange: {
    min: number
    median: number
    max: number
    percentile_25: number
    percentile_75: number
  }
  yourPosition: string
  potentialIncrease: {
    amount: number
    percentage: number
  }
  factors: string[]
  negotiationTips: string[]
  dataPoints: number
  confidence: string
}

export default function SalaryAnalysisView(props: SalaryAnalysisProps) {
  const {
    currentSalary,
    targetRole,
    location,
    experienceLevel,
    salaryRange,
    yourPosition,
    potentialIncrease,
    factors,
    negotiationTips,
    dataPoints,
    confidence
  } = props

  // Salary distribution data
  const distributionData = [
    { range: 'Min\n(10th)', value: salaryRange.min, label: `$${(salaryRange.min / 1000).toFixed(0)}K` },
    { range: '25th\nPercentile', value: salaryRange.percentile_25, label: `$${(salaryRange.percentile_25 / 1000).toFixed(0)}K` },
    { range: 'Median\n(50th)', value: salaryRange.median, label: `$${(salaryRange.median / 1000).toFixed(0)}K`, highlight: true },
    { range: '75th\nPercentile', value: salaryRange.percentile_75, label: `$${(salaryRange.percentile_75 / 1000).toFixed(0)}K` },
    { range: 'Max\n(90th)', value: salaryRange.max, label: `$${(salaryRange.max / 1000).toFixed(0)}K` }
  ]

  // Progression timeline
  const progressionData = [
    { year: 'Now', salary: currentSalary || salaryRange.min },
    { year: '6mo', salary: currentSalary ? currentSalary * 1.05 : salaryRange.percentile_25 },
    { year: '1yr', salary: currentSalary ? currentSalary * 1.15 : salaryRange.median },
    { year: '2yr', salary: currentSalary ? currentSalary * 1.30 : salaryRange.percentile_75 },
    { year: '3yr', salary: salaryRange.max * 0.9 },
    { year: '5yr', salary: salaryRange.max }
  ]

  // Location comparison (simulated)
  const locationData = [
    { city: 'San Francisco', salary: salaryRange.median * 1.4, col: 135 },
    { city: 'New York', salary: salaryRange.median * 1.3, col: 145 },
    { city: 'Seattle', salary: salaryRange.median * 1.2, col: 115 },
    { city: 'Austin', salary: salaryRange.median, col: 95 },
    { city: 'Denver', salary: salaryRange.median * 0.95, col: 100 }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl border border-slate-700">
          <p className="font-semibold">${payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              confidence === 'high' ? 'bg-green-600 text-white' :
              confidence === 'medium' ? 'bg-yellow-600 text-white' :
              'bg-orange-600 text-white'
            }`}>
              {confidence.toUpperCase()}
            </span>
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">
            ${salaryRange.median.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 dark:text-green-500">Market Median</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            Based on {dataPoints.toLocaleString()} data points
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-blue-600" size={24} />
            <Target size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">
            +${potentialIncrease.amount.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-500">Potential Increase</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">
            +{potentialIncrease.percentage}% growth
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <Award className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-1">
            ${salaryRange.percentile_75.toLocaleString()}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-500">Top 25% Earn</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            75th percentile
          </p>
        </div>

        <div className={`rounded-xl p-6 border ${
          yourPosition.includes('below') ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' :
          yourPosition.includes('above') ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' :
          'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <Target size={20} className={
              yourPosition.includes('below') ? 'text-red-600' :
              yourPosition.includes('above') ? 'text-green-600' :
              'text-blue-600'
            } />
          </div>
          <p className="text-lg font-bold capitalize mb-1">{yourPosition}</p>
          <p className="text-sm opacity-80">Your Position</p>
          {currentSalary && (
            <p className="text-xs mt-2">
              Current: ${currentSalary.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Salary Distribution Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Salary Distribution
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {targetRole} • {location} • {experienceLevel} level
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributionData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              dataKey="range"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {distributionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.highlight ? '#3b82f6' : 'url(#barGradient)'}
                  opacity={entry.highlight ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Salary Progression */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Projected Growth Timeline
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={progressionData}>
            <defs>
              <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="salary"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSalary)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Location Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="text-orange-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Salary by Location
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Adjusted for cost of living</p>
          </div>
        </div>

        <div className="space-y-4">
          {locationData.map((loc, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{loc.city}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${(loc.salary / 1000).toFixed(0)}K
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    COL: {loc.col}
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 group-hover:from-indigo-500 group-hover:to-blue-600"
                  style={{ width: `${(loc.salary / salaryRange.max) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factors & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Factors Affecting Your Salary
          </h3>
          <div className="space-y-3">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-700 dark:text-green-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{factor}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-600" />
            Negotiation Tips
          </h3>
          <div className="space-y-3">
            {negotiationTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800/30 hover:border-yellow-400 dark:hover:border-yellow-600 transition-colors">
                <Lightbulb size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
