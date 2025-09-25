import { Upload, Brain, Target, Rocket, ArrowRight, CheckCircle, Clock } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Share your profile',
      time: '30 seconds',
      description: 'Upload CV or connect LinkedIn - AI extracts and analyzes everything instantly',
      visual: (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">CV Analysis</div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Skills extracted:</span>
              <span className="text-green-600 dark:text-green-500 font-medium">24 found</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Experience mapped:</span>
              <span className="text-green-600 dark:text-green-500 font-medium">5 years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Status:</span>
              <span className="text-green-600 dark:text-green-500 font-medium">Complete</span>
            </div>
          </div>
        </div>
      )
    },
    {
      number: '02',
      icon: Brain,
      title: 'AI generates insights',
      time: '15 seconds',
      description: 'Multi-dimensional analysis across 47k+ jobs and market data',
      visual: (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">Market Analysis</div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Market position:</span>
              <span className="text-green-600 dark:text-green-500 font-medium">Strong</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Salary forecast:</span>
              <span className="text-green-600 dark:text-green-500 font-medium">+47%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Accuracy:</span>
              <span className="text-green-600 dark:text-green-500 font-medium">94%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      number: '03',
      icon: Target,
      title: 'Get your strategy',
      time: '2 minutes',
      description: 'Personalized roadmap with specific next steps and timelines',
      visual: (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">Strategic Roadmap</div>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-medium text-slate-900 dark:text-white">Learn Kubernetes</div>
              <div className="text-amber-600 dark:text-amber-500">3 months • High impact</div>
            </div>
            <div className="p-2 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-medium text-slate-900 dark:text-white">Target Senior role</div>
              <div className="text-green-600 dark:text-green-500">12 months • 89% success</div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: '04',
      icon: Rocket,
      title: 'Execute with confidence',
      time: 'Ongoing',
      description: 'Track progress and get updates as markets change',
      visual: (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">Progress Tracking</div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Skills progress:</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                  <div className="w-9 h-1 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-green-600 dark:text-green-500 font-medium">75%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">New matches:</span>
              <span className="text-blue-600 dark:text-blue-500 font-medium">12 this week</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-white tracking-tight mb-4">
            From profile to strategy
            <span className="block font-medium text-blue-600 dark:text-blue-500">in under 5 minutes</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Our AI handles the complexity - you get the clarity
          </p>
        </div>

        {/* Horizontal steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-16 left-0 right-0 h-px bg-slate-200 dark:bg-slate-800 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step number */}
                <div className="relative z-10 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-6 group-hover:scale-110 transition-transform duration-200">
                  {step.number}
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-600">
                    <Clock className="w-4 h-4" />
                    {step.time}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Visual preview */}
                  <div className="mt-6">
                    {step.visual}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom summary */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              Complete career analysis in under 5 minutes
            </span>
          </div>
          
          <div className="mt-8">
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start your analysis
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}