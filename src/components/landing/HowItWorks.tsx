// src/components/landing/HowItWorks.tsx
import { Upload, Brain, Target, Rocket } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload your CV',
      description: 'Our AI analyses your experience and skills in seconds'
    },
    {
      number: '02',
      icon: Brain,
      title: 'Get intelligence',
      description: 'Receive deep insights about your market position'
    },
    {
      number: '03',
      icon: Target,
      title: 'Set your goals',
      description: 'Define where you want to be and by when'
    },
    {
      number: '04',
      icon: Rocket,
      title: 'Take action',
      description: 'Follow your personalised strategy to success'
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white">
            Four steps to clarity
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 font-light">
            From upload to action plan in minutes, not hours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
              )}
              
              <div className="text-center group">
                {/* Number */}
                <div className="text-5xl font-thin text-slate-200 dark:text-slate-800 mb-4">
                  {step.number}
                </div>
                
                {/* Icon container */}
                <div className="relative inline-flex mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <step.icon className="h-7 w-7 text-slate-700 dark:text-slate-300" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}