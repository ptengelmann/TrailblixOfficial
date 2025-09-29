import { TrendingUp, Target, Quote, CheckCircle, Award, Users } from 'lucide-react'
import { useState } from 'react'

export default function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Product Manager',
      company: 'Spotify',
      location: 'London, UK',
      transition: 'Junior Developer → Senior PM',
      timeframe: '8 months',
      salaryBefore: '£45,000',
      salaryAfter: '£83,000',
      salaryIncrease: '+85%',
      content: 'TrailBlix AI predicted my PM transition path with surgical precision. It identified exactly which product skills I needed and the optimal timing for each move. The career intelligence was like having a personal strategist.',
      keyWin: 'Seamless career pivot with 85% salary increase',
      skills: ['Product Strategy', 'Data Analysis', 'Stakeholder Management'],
      avatar: 'SC',
      verified: true
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Staff Engineer',
      company: 'Stripe',
      location: 'Dublin, Ireland',
      transition: 'Mid-level → Staff Engineer',
      timeframe: '14 months',
      salaryBefore: '£72,000',
      salaryAfter: '£117,000',
      salaryIncrease: '+62%',
      content: 'The market intelligence was revolutionary. It showed me exactly when fintech was hiring senior talent and which technical skills commanded premium salaries. Multiple offers came exactly when predicted.',
      keyWin: 'Promoted to Staff level with competing offers',
      skills: ['System Design', 'Go', 'Kubernetes'],
      avatar: 'MR',
      verified: true
    },
    {
      name: 'Priya Patel',
      role: 'Engineering Director',
      company: 'Monzo',
      location: 'Manchester, UK',
      transition: 'Senior Dev → Director',
      timeframe: '18 months',
      salaryBefore: '£68,000',
      salaryAfter: '£132,000',
      salaryIncrease: '+94%',
      content: 'The leadership transition mapping changed everything. It outlined exactly what management experience I needed and connected strategic opportunities I never would have found. Now leading 15+ engineers.',
      keyWin: 'Breakthrough to executive leadership level',
      skills: ['Team Leadership', 'Strategic Planning', 'Technical Architecture'],
      avatar: 'PP',
      verified: true
    }
  ]

  return (
    <section className="py-32 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 mb-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <Award size={16} />
            Success Stories
          </div>

          <h2 className="text-5xl md:text-6xl font-light text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Career breakthroughs
            <span className="block font-medium text-blue-600 dark:text-blue-500 mt-2">
              powered by intelligence
            </span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
            Real professionals who used AI-driven insights to unlock strategic career moves
            <br />and achieve salary increases they never thought possible.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-8 lg:p-12 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Testimonial content */}
              <div>
                <Quote size={40} className="text-blue-600 dark:text-blue-400 mb-6" />

                <blockquote className="text-xl lg:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed mb-8 font-light">
                  &quot;{testimonials[activeTestimonial].content}&quot;
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {testimonials[activeTestimonial].avatar}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-lg">
                        {testimonials[activeTestimonial].name}
                      </span>
                      {testimonials[activeTestimonial].verified && (
                        <CheckCircle size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      {testimonials[activeTestimonial].location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success metrics */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                      {testimonials[activeTestimonial].keyWin}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <div className="text-sm text-slate-500 dark:text-slate-500 mb-1">Before</div>
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {testimonials[activeTestimonial].salaryBefore}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                      <div className="text-sm text-green-600 dark:text-green-500 mb-1">After</div>
                      <div className="font-bold text-green-700 dark:text-green-400">
                        {testimonials[activeTestimonial].salaryAfter}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                      {testimonials[activeTestimonial].salaryIncrease}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      salary increase in {testimonials[activeTestimonial].timeframe}
                    </div>
                  </div>
                </div>

                {/* Key skills gained */}
                <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Key Skills Developed</div>
                  <div className="flex flex-wrap gap-2">
                    {testimonials[activeTestimonial].skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial navigation */}
          <div className="flex justify-center gap-4 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  activeTestimonial === index
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-400 hover:border-blue-400'
                }`}
              >
                <span className="text-sm font-semibold">
                  {testimonials[index].avatar}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Success metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <TrendingUp size={24} className="text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              12.8mo
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Avg. time to promotion
            </div>
          </div>

          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Target size={24} className="text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              +73%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Avg. salary increase
            </div>
          </div>

          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Award size={24} className="text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              91%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Success rate
            </div>
          </div>

          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Users size={24} className="text-indigo-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              2.4x
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              More job offers
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}