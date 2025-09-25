// src/components/landing/FeaturesSection.tsx
import { Brain, Target, TrendingUp, Shield } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'Skills Intelligence',
      description: 'Deep AI analysis of your capabilities and market positioning',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: Target,
      title: 'Career Strategy',
      description: 'Personalised roadmaps based on your goals and timeline',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Real-time intelligence on roles, skills, and opportunities',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your data stays yours. No social features, just results',
      gradient: 'from-slate-600 to-slate-800'
    }
  ]

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white">
            Intelligence, not opinions
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 font-light">
            Data-driven career decisions powered by advanced AI analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 hover:shadow-lg"
            >
              {/* Icon with gradient background */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-10 mb-5`}>
                <feature.icon className="h-6 w-6 text-slate-700 dark:text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Subtle hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/0 to-indigo-600/0 group-hover:from-violet-600/5 group-hover:to-indigo-600/5 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}