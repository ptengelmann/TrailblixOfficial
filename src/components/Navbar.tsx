import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

interface NavbarProps {
  variant?: 'marketing' | 'app'
}

export default function Navbar({ variant = 'marketing' }: NavbarProps) {
  const router = useRouter()
  const { user } = useAuth()

  if (variant === 'app') {
    // App navbar is already in Navigation component (sidebar)
    return null
  }

  // Marketing navbar
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-white">
            Traiblix
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="#features"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#pricing"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="#about"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}