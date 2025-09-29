// Advanced AI Intelligence Dashboard
// Showcasing real-time market intelligence, career predictions, and salary insights

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Brain,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Zap,
  Clock,
  Users,
  Award,
  ArrowUp,
  ArrowDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Eye,
  RefreshCw
} from 'lucide-react'
// Removed framer-motion import

interface MarketIntelligence {
  market_overview: {
    demand_score: number
    growth_trajectory: string
    market_size: {
      total_openings: number
      new_openings_per_week: number
      competition_index: number
    }
    key_insights: string[]
  }
  salary_intelligence: {
    current_range: {
      min: number
      max: number
      median: number
    }
    trend_analysis: {
      direction: string
      percentage_change: number
      prediction_6m: number
    }
  }
  skills_landscape: {
    in_demand_skills: Array<{
      skill: string
      demand_score: number
      growth_rate: number
      salary_impact: number
    }>
  }
  predictive_insights: {
    '6_month_forecast': {
      demand_prediction: number
      salary_prediction: number
    }
  }
  confidence_score: number
}

interface CareerPrediction {
  prediction_summary: {
    confidence_score: number
    timeframe: string
  }
  career_trajectory: {
    most_likely_path: {
      next_role: string
      probability: number
      timeline: string
      expected_salary_range: {
        min: number
        max: number
      }
    }
  }
  skills_evolution: {
    critical_skills_to_develop: Array<{
      skill: string
      importance_score: number
      learning_timeline: string
    }>
  }
  market_positioning: {
    current_marketability: {
      score: number
    }
    projected_marketability: {
      '6_months': number
      '12_months': number
    }
  }
}

export default function IntelligenceDashboard() {
  const router = useRouter()
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null)
  const [careerPrediction, setCareerPrediction] = useState<CareerPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    jobsAnalyzed: 47832,
    predictionsGenerated: 3247,
    accuracyRate: 94.2,
    usersActive: 1247
  })

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        jobsAnalyzed: prev.jobsAnalyzed + Math.floor(Math.random() * 5) + 2,
        predictionsGenerated: prev.predictionsGenerated + Math.floor(Math.random() * 3) + 1,
        accuracyRate: 94.2 + (Math.random() - 0.5) * 0.4,
        usersActive: prev.usersActive + Math.floor(Math.random() * 10) - 5
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Load intelligence data
  useEffect(() => {
    loadIntelligenceData()
  }, [])

  const loadIntelligenceData = async () => {
    setIsLoading(true)

    try {
      // Simulate API calls to our advanced endpoints
      await new Promise(resolve => setTimeout(resolve, 1500)) // Loading simulation

      // Mock data that would come from our APIs
      const mockMarketIntelligence: MarketIntelligence = {
        market_overview: {
          demand_score: 87,
          growth_trajectory: 'strong',
          market_size: {
            total_openings: 15420,
            new_openings_per_week: 312,
            competition_index: 0.73
          },
          key_insights: [
            'AI/ML skills demand increased 67% this quarter',
            'Remote positions offer 15% salary premium',
            'Senior roles showing fastest growth in fintech sector'
          ]
        },
        salary_intelligence: {
          current_range: {
            min: 95000,
            max: 165000,
            median: 130000
          },
          trend_analysis: {
            direction: 'rising',
            percentage_change: 12.4,
            prediction_6m: 138000
          }
        },
        skills_landscape: {
          in_demand_skills: [
            { skill: 'Machine Learning', demand_score: 96, growth_rate: 45.2, salary_impact: 28 },
            { skill: 'Kubernetes', demand_score: 89, growth_rate: 34.1, salary_impact: 22 },
            { skill: 'System Design', demand_score: 92, growth_rate: 28.7, salary_impact: 25 },
            { skill: 'React', demand_score: 85, growth_rate: 12.3, salary_impact: 8 },
            { skill: 'Python', demand_score: 94, growth_rate: 23.5, salary_impact: 18 }
          ]
        },
        predictive_insights: {
          '6_month_forecast': {
            demand_prediction: 91,
            salary_prediction: 138000
          }
        },
        confidence_score: 94
      }

      const mockCareerPrediction: CareerPrediction = {
        prediction_summary: {
          confidence_score: 91,
          timeframe: '18m'
        },
        career_trajectory: {
          most_likely_path: {
            next_role: 'Senior Software Engineer',
            probability: 87,
            timeline: '12-18 months',
            expected_salary_range: {
              min: 140000,
              max: 185000
            }
          }
        },
        skills_evolution: {
          critical_skills_to_develop: [
            { skill: 'System Architecture', importance_score: 94, learning_timeline: '4-6 months' },
            { skill: 'Team Leadership', importance_score: 89, learning_timeline: '6-12 months' },
            { skill: 'AI Integration', importance_score: 96, learning_timeline: '3-6 months' }
          ]
        },
        market_positioning: {
          current_marketability: {
            score: 78
          },
          projected_marketability: {
            '6_months': 84,
            '12_months': 91
          }
        }
      }

      setMarketIntelligence(mockMarketIntelligence)
      setCareerPrediction(mockCareerPrediction)
    } catch (error) {
      console.error('Failed to load intelligence data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Processing Market Intelligence</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Analyzing 47,000+ job postings with AI...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Intelligence Dashboard</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Real-time market analysis & career predictions</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-950/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Live Analysis</span>
              </div>

              <button
                onClick={loadIntelligenceData}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Activity size={14} />
                <span>{realTimeMetrics.jobsAnalyzed.toLocaleString()} jobs analyzed today</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={14} />
                <span>{realTimeMetrics.predictionsGenerated.toLocaleString()} predictions generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} />
                <span>{realTimeMetrics.accuracyRate.toFixed(1)}% prediction accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>{realTimeMetrics.usersActive.toLocaleString()} active professionals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8 bg-white dark:bg-slate-900 p-2 rounded-xl">
          {[
            { id: 'overview', label: 'Market Overview', icon: BarChart3 },
            { id: 'predictions', label: 'Career Predictions', icon: TrendingUp },
            { id: 'skills', label: 'Skills Intelligence', icon: Brain },
            { id: 'salary', label: 'Salary Analysis', icon: DollarSign }
          ].map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{section.label}</span>
              </button>
            )
          })}
        </div>

        {/* Market Overview Section */}
        {activeSection === 'overview' && marketIntelligence && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {marketIntelligence.market_overview.demand_score}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Demand Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUp size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {marketIntelligence.market_overview.growth_trajectory}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {marketIntelligence.market_overview.market_size.total_openings.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Total Openings</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUp size={14} className="text-blue-500" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    +{marketIntelligence.market_overview.market_size.new_openings_per_week} weekly
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${marketIntelligence.salary_intelligence.current_range.median.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Median Salary</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUp size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    +{marketIntelligence.salary_intelligence.trend_analysis.percentage_change}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/30 rounded-xl flex items-center justify-center">
                    <Brain className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {marketIntelligence.confidence_score}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">AI Confidence</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    High accuracy
                  </span>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Market Insights</h3>
              </div>
              <div className="space-y-3">
                {marketIntelligence.market_overview.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Intelligence Section */}
        {activeSection === 'skills' && marketIntelligence && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/30 rounded-lg flex items-center justify-center">
                  <Brain className="text-purple-600 dark:text-purple-400" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">High-Demand Skills Analysis</h3>
              </div>

              <div className="space-y-4">
                {marketIntelligence.skills_landscape.in_demand_skills.map((skill, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900 dark:text-white">{skill.skill}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          +{skill.salary_impact}% salary impact
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                          {skill.demand_score}/100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-500">Market Demand</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${skill.demand_score}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{skill.demand_score}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-500">Growth Rate</span>
                        <div className="flex items-center gap-2 mt-1">
                          <ArrowUp size={14} className="text-green-500" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            +{skill.growth_rate}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-500">Salary Impact</span>
                        <div className="flex items-center gap-2 mt-1">
                          <DollarSign size={14} className="text-green-500" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            +{skill.salary_impact}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Career Predictions Section */}
        {activeSection === 'predictions' && careerPrediction && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Career Trajectory */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                    <Target className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Career Trajectory</h3>
                  <div className="ml-auto px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                    {careerPrediction.prediction_summary.confidence_score}% confidence
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Most Likely Next Role</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{careerPrediction.career_trajectory.most_likely_path.probability}% probability</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">
                      {careerPrediction.career_trajectory.most_likely_path.next_role}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-300">{careerPrediction.career_trajectory.most_likely_path.timeline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-green-500" />
                        <span className="text-green-600 dark:text-green-400">
                          ${careerPrediction.career_trajectory.most_likely_path.expected_salary_range.min.toLocaleString()} - ${careerPrediction.career_trajectory.most_likely_path.expected_salary_range.max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketability Score */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                    <Award className="text-green-600 dark:text-green-400" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Marketability Forecast</h3>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {careerPrediction.market_positioning.current_marketability.score}/100
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Current Market Position</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">6 months</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${careerPrediction.market_positioning.projected_marketability['6_months']}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white w-8">
                          {careerPrediction.market_positioning.projected_marketability['6_months']}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">12 months</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${careerPrediction.market_positioning.projected_marketability['12_months']}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white w-8">
                          {careerPrediction.market_positioning.projected_marketability['12_months']}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Development Priority */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/30 rounded-lg flex items-center justify-center">
                  <Zap className="text-purple-600 dark:text-purple-400" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Priority Skills to Develop</h3>
              </div>

              <div className="space-y-4">
                {careerPrediction.skills_evolution.critical_skills_to_develop.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{skill.skill}</span>
                        <div className="px-2 py-1 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">
                          Priority {skill.importance_score}/100
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Learning timeline: {skill.learning_timeline}
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {skill.importance_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}