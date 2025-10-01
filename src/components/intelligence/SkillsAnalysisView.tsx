// Professional Skills Analysis View
// Clean, modern skill tracking with visual progress indicators

import { Brain, CheckCircle, Clock, TrendingUp, BookOpen } from 'lucide-react'

interface Skill {
  skill: string
  priority: 'critical' | 'high' | 'medium' | 'nice_to_have'
  learning_time: string
  impact_on_salary: number
  resources: string[]
}

interface SkillsAnalysisProps {
  skillsYouHave: string[]
  skillsToLearn: Skill[]
  targetRoleSkills: string[]
  coveragePercentage: number
}

export default function SkillsAnalysisView({
  skillsYouHave,
  skillsToLearn,
  targetRoleSkills,
  coveragePercentage
}: SkillsAnalysisProps) {

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950/20'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
      case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
      default: return 'border-slate-300 bg-slate-50 dark:bg-slate-900'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-orange-600 text-white'
      case 'medium': return 'bg-blue-600 text-white'
      default: return 'bg-slate-600 text-white'
    }
  }

  // Group skills by priority
  const criticalSkills = skillsToLearn.filter(s => s.priority === 'critical')
  const highPrioritySkills = skillsToLearn.filter(s => s.priority === 'high')
  const mediumPrioritySkills = skillsToLearn.filter(s => s.priority === 'medium')
  const niceToHaveSkills = skillsToLearn.filter(s => s.priority === 'nice_to_have')

  return (
    <div className="space-y-6">
      {/* Header with Coverage */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills Coverage</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              You have {skillsYouHave.length} of {targetRoleSkills.length} required skills
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{coveragePercentage}%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${coveragePercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-slate-600 dark:text-slate-400">
              {skillsYouHave.length} Skills Mastered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-orange-600" />
            <span className="text-slate-600 dark:text-slate-400">
              {skillsToLearn.length} Skills to Learn
            </span>
          </div>
        </div>
      </div>

      {/* Skills You Have */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills You Have</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{skillsYouHave.length} mastered skills</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {skillsYouHave.map((skill, i) => (
            <div
              key={i}
              className="group px-4 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all duration-200"
            >
              <span className="text-sm font-medium text-green-900 dark:text-green-100">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Skills */}
      {criticalSkills.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <TrendingUp className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Critical Skills</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Must learn immediately for your target role</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalSkills.map((skill, i) => (
              <div
                key={i}
                className={`group p-4 border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${getPriorityColor(skill.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{skill.skill}</h4>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getPriorityBadge(skill.priority)}`}>
                    CRITICAL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{skill.learning_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      +{skill.impact_on_salary}% salary
                    </span>
                  </div>
                </div>

                {skill.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={14} className="text-slate-600 dark:text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Learning Resources</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.resources.map((resource, ri) => (
                        <span key={ri} className="text-xs px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Priority Skills */}
      {highPrioritySkills.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
              <Brain className="text-orange-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">High Priority Skills</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Important for advancing your career</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {highPrioritySkills.map((skill, i) => (
              <div
                key={i}
                className={`group p-4 border rounded-xl hover:shadow-md transition-all duration-200 ${getPriorityColor(skill.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{skill.skill}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityBadge(skill.priority)}`}>
                    HIGH
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{skill.learning_time}</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">+{skill.impact_on_salary}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium & Nice to Have */}
      {(mediumPrioritySkills.length > 0 || niceToHaveSkills.length > 0) && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Additional Skills</h3>

          <div className="flex flex-wrap gap-2">
            {[...mediumPrioritySkills, ...niceToHaveSkills].map((skill, i) => (
              <div
                key={i}
                className="group px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{skill.skill}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{skill.learning_time}</span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">+{skill.impact_on_salary}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
