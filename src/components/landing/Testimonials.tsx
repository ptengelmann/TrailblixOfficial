// src/components/landing/Testimonials.tsx
import { Star } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'Previous: Junior Dev → Current: Senior PM',
      content: 'The AI analysis showed me exactly which skills to develop. Landed my dream role in 4 months.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'Data Scientist',
      company: 'Transitioned from Finance',
      content: 'Better than any career coach. The market insights helped me negotiate a 40% salary increase.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Engineering Lead',
      company: 'Promoted twice in 18 months',
      content: 'The skills gap analysis was spot on. Focused learning = accelerated growth.',
      rating: 5
    }
  ]

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white">
            Real results, real careers
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 font-light">
            Join thousands making smarter career moves
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {testimonial.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {testimonial.role}
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                  {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}