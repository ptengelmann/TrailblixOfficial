import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Sparkles, Target, TrendingUp, Users } from 'lucide-react'
import { GetServerSideProps } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface HomeProps {
  hasAnthropicKey: boolean
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return {
    props: {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    },
  }
}

export default function Home({ hasAnthropicKey }: HomeProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const features = [
    {
      icon: Target,
      title: 'Career Goals',
      description: 'Define your career objectives and get personalized guidance'
    },
    {
      icon: Sparkles,
      title: 'AI Resume Analysis',
      description: 'Get intelligent feedback to improve your resume'
    },
    {
      icon: TrendingUp,
      title: 'Job Matching',
      description: 'Find opportunities that align with your goals'
    },
  ]

  const benefits = [
    'AI-powered career recommendations',
    'Comprehensive resume analysis',
    'Personalized job matching',
    'Track your career progress',
    'Industry insights and trends',
    'Interview preparation tools'
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
            AI-Powered Career Intelligence Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Navigate your career journey with confidence. Get personalized insights, optimize your resume, and discover opportunities that match your goals.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Start your journey
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-violet-200 to-indigo-200 dark:from-violet-900 dark:to-indigo-900 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need for career success
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Powerful tools to accelerate your professional growth
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-slate-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                Why choose Traiblix?
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                We combine cutting-edge AI with career expertise to help you make informed decisions about your professional future.
              </p>
              <div className="mt-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 dark:text-slate-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="aspect-video bg-white dark:bg-slate-950 rounded-lg flex items-center justify-center">
                  <Users className="h-16 w-16 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 dark:bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white dark:text-slate-900 sm:text-4xl">
            Ready to accelerate your career?
          </h2>
          <p className="mt-4 text-lg text-slate-300 dark:text-slate-600">
            Join thousands of professionals who are already using Traiblix
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Get started free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}