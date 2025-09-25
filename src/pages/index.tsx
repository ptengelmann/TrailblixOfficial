// src/pages/index.tsx
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'
import CTASection from '@/components/landing/CTASection'
import DemoSection from '@/components/landing/DemoSection'

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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      
      {/* All sections are now modular components */}
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      
      <Footer />
    </div>
  )
}