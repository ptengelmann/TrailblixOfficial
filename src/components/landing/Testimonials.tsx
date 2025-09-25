import { Star, TrendingUp, ArrowRight, Target } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Product Manager',
      company: 'Spotify',
      transition: 'Junior Developer → Senior PM',
      timeframe: '8 months',
      salaryIncrease: '+85%',
      content: 'The AI predicted the PM transition path perfectly. It identified exactly which product skills I needed and the optimal timing for the switch.',
      beforeAfter: {
        before: '£45k • Junior Dev • Unclear path',
        after: '£83k • Senior PM • Clear trajectory'
      },
      avatar: 'SC'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Staff Engineer', 
      company: 'Stripe',
      transition: 'Mid-level → Staff Engineer',
      timeframe: '14 months',
      salaryIncrease: '+62%',
      content: 'The market intelligence was incredible. It showed me exactly when fintech was hiring senior engineers and which skills commanded the highest premiums.',
      beforeAfter: {
        before: '£72k • Mid-level • Multiple rejections',
        after: '£117k • Staff level • Multiple offers'
      },
      avatar: 'MR'
    },
    {
      name: 'Priya Patel',
      role: 'Engineering Director',
      company: 'Monzo',
      transition: 'Senior Dev → Director',
      timeframe: '18 months',
      salaryIncrease: '+94%',
      content: 'The leadership transition mapping was game-changing. It outlined the exact management experience I needed and connected me with the right opportunities.',
      beforeAfter: {
        before: '£68k • Senior Dev • Stuck in IC track',
        after: '£132k • Director • Leading 15+ engineers'
      },
      avatar: 'PP'
    }
  ]

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-white tracking-tight mb-4">
            Real careers transformed
            <span className="block font-medium text-blue-600 dark:text-blue-500">by AI intelligence</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            See how professionals used our insights to accelerate their careers
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative">
              {/* Main testimonial card */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg">
                
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-500">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                  
                  {/* Success metrics */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600 dark:text-green-500">
                      {testimonial.salaryIncrease}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-600">
                      salary increase
                    </div>
                  </div>
                </div>

                {/* Transition path */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-600 mb-2">Career Transition</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-700 dark:text-slate-300">{testimonial.transition}</span>
                    <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-500 font-medium">{testimonial.timeframe}</span>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Before/After comparison */}
                <div className="grid grid-cols-1 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Before: {testimonial.beforeAfter.before}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-xs text-green-600 dark:text-green-500 font-medium">After: {testimonial.beforeAfter.after}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results summary */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-500 mb-2">
              12.8 months
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Average time to next level
            </div>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-bold text-green-600 dark:text-green-500 mb-2">
              +73%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Average salary increase
            </div>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-500 mb-2">
              91%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Success rate
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}