import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Target, Users, Lightbulb, Heart, TrendingUp, Globe, Award, Zap } from 'lucide-react'

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Data-Driven Decisions',
      description: 'We believe career choices should be based on real market data, not guesswork. Our AI analyzes millions of data points to provide actionable insights.'
    },
    {
      icon: Users,
      title: 'Empowering Professionals',
      description: 'Every professional deserves access to the same career intelligence as top recruiters. We democratize access to powerful career data.'
    },
    {
      icon: Lightbulb,
      title: 'Continuous Innovation',
      description: 'We leverage cutting-edge AI technology to provide insights that evolve with the job market, staying ahead of industry trends.'
    },
    {
      icon: Heart,
      title: 'Career Success',
      description: 'Your success is our success. We measure our impact by your career growth and the opportunities you unlock.'
    }
  ]

  const stats = [
    { value: '2025', label: 'Launched' },
    { value: '47K+', label: 'Jobs Analyzed Daily' },
    { value: '94%', label: 'Prediction Accuracy' },
    { value: '12.3K', label: 'Career Paths Mapped' }
  ]

  const team = [
    {
      icon: Award,
      title: 'Industry Expertise',
      description: 'Our team combines decades of experience in AI, career development, and data science from leading tech companies.'
    },
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'We push the boundaries of what\'s possible with AI-powered career intelligence, constantly improving our algorithms.'
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'We analyze job markets across multiple countries and industries to provide comprehensive career insights.'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full mb-6">
                <Globe size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">About TrailBlix</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 dark:text-white mb-6">
                Empowering careers through
                <span className="block mt-2 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-driven intelligence
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light max-w-3xl mx-auto leading-relaxed">
                We&apos;re on a mission to democratize career intelligence and help professionals make informed, data-backed decisions about their future.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white leading-tight">
                  Built by professionals,
                  <span className="block font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    for professionals
                  </span>
                </h2>

                <div className="space-y-4 text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  <p>
                    TrailBlix was born from a simple observation: career decisions are some of the most important choices we make, yet most professionals navigate them blindly.
                  </p>
                  <p>
                    We watched talented individuals struggle to understand their market value, miss opportunities due to lack of information, and make career moves based on gut feeling rather than data.
                  </p>
                  <p>
                    That&apos;s why we built TrailBlix—to give every professional access to the same powerful career intelligence that top companies use to hire and retain talent.
                  </p>
                  <p>
                    Our AI analyzes millions of job postings, salary data points, and career trajectories to provide personalized insights that help you make confident career decisions backed by real market data.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    What makes us different
                  </h3>
                  <div className="space-y-4">
                    {team.map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-light">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white mb-4">
                What <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">drives us</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto">
                Our core values guide everything we build and every decision we make
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => {
                const Icon = value.icon
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp size={24} className="text-white" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                  Our Mission
                </h2>
              </div>
              <p className="text-lg sm:text-xl text-white/90 font-light leading-relaxed">
                To empower every professional with AI-driven career intelligence that enables confident, data-backed decisions and accelerates career growth in an ever-changing job market.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
