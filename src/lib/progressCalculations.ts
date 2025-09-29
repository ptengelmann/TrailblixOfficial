import { CareerMilestone, WeeklyProgress, UserActivity, ProgressSummary } from '../types/progress'

export class ProgressCalculator {
  
  static calculateMomentumScore(weeklyData: {
    applications_count: number
    jobs_viewed: number
    jobs_saved: number
    resume_updates: number
    skill_progress_updates: number
    networking_activities: number
  }): number {
    const weights = {
      applications_count: 30,
      jobs_saved: 15,
      jobs_viewed: 10,
      resume_updates: 20,
      skill_progress_updates: 15,
      networking_activities: 10
    }

    const maxValues = {
      applications_count: 10,
      jobs_saved: 20,
      jobs_viewed: 50,
      resume_updates: 2,
      skill_progress_updates: 5,
      networking_activities: 5
    }

    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([key, weight]) => {
      const value = weeklyData[key as keyof typeof weeklyData] || 0
      const maxValue = maxValues[key as keyof typeof maxValues]
      const normalizedValue = Math.min(value / maxValue, 1)
      totalScore += normalizedValue * weight
      totalWeight += weight
    })

    return Math.round((totalScore / totalWeight) * 100)
  }

  static calculateGoalProgress(milestones: CareerMilestone[]): number {
    if (milestones.length === 0) return 0

    const activeMilestones = milestones.filter(m => m.status === 'active')
    if (activeMilestones.length === 0) return 100

    let totalProgress = 0
    activeMilestones.forEach(milestone => {
      const progress = Math.min(milestone.current_value / milestone.target_value, 1)
      totalProgress += progress
    })

    return Math.round((totalProgress / activeMilestones.length) * 100)
  }

  static generateWeeklyInsights(
    currentWeek: WeeklyProgress,
    previousWeek?: WeeklyProgress,
    milestones?: CareerMilestone[]
  ): string[] {
    const insights: string[] = []

    if (currentWeek.applications_count === 0) {
      insights.push("No applications sent this week - this is your biggest opportunity for improvement")
    } else if (currentWeek.applications_count < 3) {
      insights.push("Your application rate is below the recommended 3-5 per week for active job seekers")
    } else if (currentWeek.applications_count > 10) {
      insights.push("High application volume - make sure you're targeting quality opportunities")
    }

    if (previousWeek) {
      const momentumChange = currentWeek.momentum_score - previousWeek.momentum_score
      if (momentumChange > 10) {
        insights.push(`Strong momentum gain (+${momentumChange} points) - keep this pace!`)
      } else if (momentumChange < -10) {
        insights.push(`Momentum declined by ${Math.abs(momentumChange)} points - time to re-engage`)
      }
    }

    if (milestones) {
      const overdueMilestones = milestones.filter(m => 
        m.status === 'active' && new Date(m.target_date) < new Date()
      )
      if (overdueMilestones.length > 0) {
        insights.push(`${overdueMilestones.length} milestone(s) are overdue - consider adjusting timelines`)
      }
    }

    const viewToApplicationRatio = currentWeek.applications_count > 0 
      ? currentWeek.jobs_viewed / currentWeek.applications_count 
      : currentWeek.jobs_viewed

    if (viewToApplicationRatio > 20) {
      insights.push("You're viewing many jobs but not applying - focus on converting views to applications")
    } else if (viewToApplicationRatio < 5 && currentWeek.applications_count > 0) {
      insights.push("Good application rate, but consider researching more opportunities")
    }

    return insights
  }

  static calculateWeeklyStreak(weeklyProgressHistory: WeeklyProgress[]): number {
    if (weeklyProgressHistory.length === 0) return 0

    const sorted = weeklyProgressHistory.sort((a, b) => 
      new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
    )

    let streak = 0
    for (const week of sorted) {
      if (week.momentum_score > 20) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  static calculateMomentumTrend(weeklyProgressHistory: WeeklyProgress[]): 'improving' | 'stable' | 'declining' {
    if (weeklyProgressHistory.length < 3) return 'stable'

    const recent = weeklyProgressHistory
      .sort((a, b) => new Date(b.week_start).getTime() - new Date(a.week_start).getTime())
      .slice(0, 3)

    const scores = recent.map(w => w.momentum_score)
    const avgRecent = (scores[0] + scores[1]) / 2
    const avgOlder = scores[2]

    const change = avgRecent - avgOlder

    if (change > 15) return 'improving'
    if (change < -15) return 'declining'
    return 'stable'
  }

  static getNextPriorityMilestones(milestones: CareerMilestone[]): CareerMilestone[] {
    return milestones
      .filter(m => m.status === 'active')
      .sort((a, b) => {
        const aUrgency = new Date(a.target_date).getTime()
        const bUrgency = new Date(b.target_date).getTime()

        if (aUrgency < Date.now() && bUrgency >= Date.now()) return -1
        if (bUrgency < Date.now() && aUrgency >= Date.now()) return 1

        return aUrgency - bUrgency
      })
      .slice(0, 3)
  }

  static generateRecommendations(summary: Partial<ProgressSummary>): string[] {
    const recommendations: string[] = []

    if (!summary.current_week) return ["Complete your profile setup to get personalized recommendations"]

    const week = summary.current_week

    if (week.applications_count < 2) {
      recommendations.push("Increase your application rate to 3-5 quality applications per week")
    }

    if (week.networking_activities === 0) {
      recommendations.push("Add networking activities - reach out to 2-3 professionals in your target companies this week")
    }

    if (week.skill_progress_updates === 0) {
      recommendations.push("Track your skill development progress - update completed courses or certifications")
    }

    if (week.resume_updates === 0 && week.applications_count > 0) {
      recommendations.push("Consider refreshing your resume - successful job seekers update their resume monthly")
    }

    if (summary.momentum_trend === 'declining') {
      recommendations.push("Your job search momentum is declining - schedule dedicated job search blocks in your calendar")
    } else if (summary.momentum_trend === 'improving') {
      recommendations.push("Great momentum! Now focus on application quality over quantity")
    }

    if (summary.benchmark_comparison?.performance_delta.applications && 
        summary.benchmark_comparison.performance_delta.applications < -20) {
      recommendations.push("Your application rate is 20%+ below peers - consider setting a daily application goal")
    }

    return recommendations.slice(0, 4)
  }

  static createDefaultMilestones(careerObjectives: { timeline?: string; career_stage?: string; primary_goal?: string }): Partial<CareerMilestone>[] {
    const milestones: Partial<CareerMilestone>[] = []
    
    let weeklyApplications = 3
    if (careerObjectives.timeline === 'immediate') weeklyApplications = 8
    else if (careerObjectives.timeline === 'short') weeklyApplications = 5
    else if (careerObjectives.timeline === 'medium') weeklyApplications = 3
    else if (careerObjectives.timeline === 'long') weeklyApplications = 2

    const monthlyApplications = weeklyApplications * 4

    milestones.push({
      milestone_type: 'application_goal',
      title: 'Monthly Application Target',
      description: `Apply to ${monthlyApplications} relevant positions this month`,
      target_value: monthlyApplications,
      current_value: 0,
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    })

    milestones.push({
      milestone_type: 'networking',
      title: 'Monthly Networking Goal',
      description: 'Connect with professionals in your target industry',
      target_value: 8,
      current_value: 0,
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    })

    if (careerObjectives.career_stage === 'student' || careerObjectives.primary_goal === 'career_change') {
      milestones.push({
        milestone_type: 'skill_development',
        title: 'Skill Development Progress',
        description: 'Complete learning modules or courses',
        target_value: 4,
        current_value: 0,
        target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      })
    }

    return milestones
  }
}