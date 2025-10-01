// Ultra-Detailed Salary Analysis
// Comprehensive salary breakdown with multiple data visualizations

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts'
import { DollarSign, TrendingUp, Award, MapPin, Briefcase, Target, ArrowUp, ArrowDown, Minus, Sparkles } from 'lucide-react'

interface SalaryDataProps {
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

export default function DetailedSalaryAnalysis(props: SalaryDataProps) {
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

  // Prepare distribution data
  const distributionData = [
    { range: 'Bottom 10%', value: salaryRange.min, color: '#ef4444' },
    { range: '25th %ile', value: salaryRange.percentile_25, color: '#f97316' },
    { range: 'Median', value: salaryRange.median, color: '#10b981', highlight: true },
    { range: '75th %ile', value: salaryRange.percentile_75, color: '#3b82f6' },
    { range: 'Top 10%', value: salaryRange.max, color: '#8b5cf6' }
  ]

  // Salary progression timeline
  const progressionData = [
    { year: 'Now', salary: currentSalary || salaryRange.min },
    { year: '6mo', salary: currentSalary ? currentSalary * 1.05 : salaryRange.percentile_25 },
    { year: '1yr', salary: currentSalary ? currentSalary * 1.15 : salaryRange.median },
    { year: '2yr', salary: currentSalary ? currentSalary * 1.30 : salaryRange.percentile_75 },
    { year: '3yr', salary: salaryRange.max * 0.9 },
    { year: '5yr', salary: salaryRange.max }
  ]

  // Location comparison data (simulated - would come from API)
  const locationComparison = [
    { location: 'San Francisco', salary: salaryRange.median * 1.4, col: 135 },
    { location: 'New York', salary: salaryRange.median * 1.3, col: 145 },
    { location: 'Seattle', salary: salaryRange.median * 1.2, col: 115 },
    { location: 'Austin', salary: salaryRange.median * 1.0, col: 95 },
    { location: 'Denver', salary: salaryRange.median * 0.95, col: 100 }
  ]

  // Compensation breakdown
  const compensationBreakdown = [
    { component: 'Base Salary', value: 75, fullMark: 100 },
    { component: 'Bonus', value: 65, fullMark: 100 },
    { component: 'Equity/RSUs', value: 55, fullMark: 100 },
    { component: 'Benefits', value: 80, fullMark: 100 },
    { component: 'Perks', value: 70, fullMark: 100 }
  ]

  const getPositionColor = () => {
    if (yourPosition.includes('below')) return 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
    if (yourPosition.includes('above')) return 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
    return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
  }

  const getPositionIcon = () => {
    if (yourPosition.includes('below')) return <ArrowDown size={20} />
    if (yourPosition.includes('above')) return <ArrowUp size={20} />
    return <Minus size={20} />
  }

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
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

        <div className={`rounded-xl p-6 border ${getPositionColor()}`}>
          <div className="flex items-center justify-between mb-2">
            {getPositionIcon()}
            <Target size={20} />
          </div>
          <p className="text-lg font-bold capitalize mb-1">{yourPosition}</p>
          <p className="text-sm opacity-80">Your Position</p>
          {currentSalary && (
            <p className="text-xs mt-2">
              Current: ${currentSalary.toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-blue-600" size={24} />
            <ArrowUp className="text-green-600" size={20} />
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
            <Sparkles className="text-yellow-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-1">
            ${salaryRange.percentile_75.toLocaleString()}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-500">Top 25% Earn</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            75th percentile
          </p>
        </div>
      </div>

      {/* Salary Distribution Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Salary Distribution for {targetRole}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {location} • {experienceLevel} level
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="range" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Salary']}
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={entry.highlight ? 1 : 0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Distribution Legend */}
        <div className="mt-6 grid grid-cols-5 gap-3">
          {distributionData.map((item, i) => (
            <div key={i} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-4 h-4 rounded mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{item.range}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                ${(item.value / 1000).toFixed(0)}K
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Progression Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Projected Salary Growth Timeline
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Projected Salary']}
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
            />
            <Line
              type="monotone"
              dataKey="salary"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Location Comparison */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
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
          {locationComparison.map((loc, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-slate-700 dark:text-slate-300">
                {loc.location}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(loc.salary / salaryRange.max) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-28 text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${(loc.salary / 1000).toFixed(0)}K
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                      COL: {loc.col}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compensation Breakdown Radar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Total Compensation Breakdown
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={compensationBreakdown}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="component" stroke="#64748b" />
            <PolarRadiusAxis stroke="#64748b" />
            <Radar name="Your Package" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Salary Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Factors Affecting Your Salary
          </h3>
          <div className="space-y-3">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-700 dark:text-green-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{factor}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-600" />
            Negotiation Strategy
          </h3>
          <div className="space-y-3">
            {negotiationTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-yellow-600" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
