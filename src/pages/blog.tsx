import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, User, ArrowRight, TrendingUp, Brain, Target, Lightbulb } from 'lucide-react'

export default function Blog() {
  const featuredPost = {
    title: 'How AI is Revolutionizing Career Planning in 2025',
    excerpt: 'Discover how artificial intelligence is transforming the way professionals approach career decisions, from salary negotiations to skill development.',
    category: 'AI Insights',
    date: 'January 15, 2025',
    author: 'TrailBlix Team',
    readTime: '8 min read',
    image: '/blog/ai-career.jpg',
    slug: 'ai-revolutionizing-career-planning-2025'
  }

  const posts = [
    {
      title: '10 Data-Driven Strategies to Boost Your Salary in 2025',
      excerpt: 'Learn how to leverage market data and AI insights to maximize your earning potential and negotiate with confidence.',
      category: 'Salary Intelligence',
      date: 'January 10, 2025',
      author: 'TrailBlix Team',
      readTime: '6 min read',
      slug: 'data-driven-salary-strategies-2025',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'The Hidden Job Market: How to Find Opportunities Before They\'re Posted',
      excerpt: 'Uncover the secret strategies top professionals use to discover and land positions before they hit job boards.',
      category: 'Job Search',
      date: 'January 5, 2025',
      author: 'TrailBlix Team',
      readTime: '7 min read',
      slug: 'hidden-job-market-strategies',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Skills Gap Analysis: What to Learn for Maximum Career Impact',
      excerpt: 'Use AI-powered analysis to identify exactly which skills will have the biggest impact on your career trajectory.',
      category: 'Skill Development',
      date: 'December 28, 2024',
      author: 'TrailBlix Team',
      readTime: '5 min read',
      slug: 'skills-gap-analysis-guide',
      icon: Brain,
      color: 'indigo'
    },
    {
      title: 'Career Pivoting in Tech: A Complete Guide for 2025',
      excerpt: 'Everything you need to know about successfully transitioning to a new role or industry in the tech sector.',
      category: 'Career Growth',
      date: 'December 20, 2024',
      author: 'TrailBlix Team',
      readTime: '10 min read',
      slug: 'career-pivoting-tech-guide',
      icon: Lightbulb,
      color: 'purple'
    },
    {
      title: 'Networking in the AI Era: Building Meaningful Professional Connections',
      excerpt: 'Modern strategies for building a powerful professional network that accelerates your career growth.',
      category: 'Networking',
      date: 'December 15, 2024',
      author: 'TrailBlix Team',
      readTime: '6 min read',
      slug: 'networking-ai-era-strategies',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Understanding Your Market Value: A Data-Driven Approach',
      excerpt: 'Learn how to accurately assess your worth in the job market using real salary data and market trends.',
      category: 'Salary Intelligence',
      date: 'December 10, 2024',
      author: 'TrailBlix Team',
      readTime: '7 min read',
      slug: 'understanding-market-value',
      icon: TrendingUp,
      color: 'green'
    }
  ]

  const categories = [
    'All Posts',
    'AI Insights',
    'Salary Intelligence',
    'Job Search',
    'Skill Development',
    'Career Growth',
    'Networking'
  ]

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-12 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full mb-6">
                <Lightbulb size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Career Insights</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 dark:text-white mb-6">
                Career intelligence
                <span className="block mt-2 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  insights & guides
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light max-w-3xl mx-auto leading-relaxed">
                Expert advice, data-driven insights, and actionable strategies to accelerate your career growth
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {categories.map((category, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    i === 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-12 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-4 w-fit">
                    <span className="text-white text-xs font-semibold">Featured Article</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    {featuredPost.title}
                  </h2>

                  <p className="text-lg text-white/90 font-light mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-4 mb-6 text-white/80 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{featuredPost.author}</span>
                    </div>
                    <span>{featuredPost.readTime}</span>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-fit"
                  >
                    Read Article
                    <ArrowRight size={18} />
                  </Link>
                </div>

                <div className="bg-blue-700/20 p-12 flex items-center justify-center">
                  <div className="w-full h-full min-h-[300px] bg-white/10 rounded-xl flex items-center justify-center">
                    <Brain size={64} className="text-white/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => {
                const Icon = post.icon
                return (
                  <article
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="bg-slate-100 dark:bg-slate-900 p-12 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getColorClasses(post.color)}`}>
                        <Icon size={32} />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getColorClasses(post.color)}`}>
                          {post.category}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-sm text-slate-600 dark:text-slate-400 font-light mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {post.date}
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
                        >
                          Read more
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-700">
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white mb-4">
                Stay updated with career insights
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light mb-8">
                Get the latest articles, tips, and AI-powered career strategies delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
