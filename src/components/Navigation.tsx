import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  User,
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  Search,
  Bookmark,
  Sparkles,
  Brain
} from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile & Goals', href: '/profile', icon: User },
    { name: 'Resume Analyzer', href: '/resume-analyzer', icon: FileText },
    { name: 'AI Career Coach', href: '/career-coach', icon: Sparkles },
    { name: 'Job Search', href: '/jobs', icon: Search },
    { name: 'Saved Jobs', href: '/saved-jobs', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => router.pathname === href

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Traiblix
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Career Intelligence
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto py-6">
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      active ? 'text-blue-600 dark:text-blue-400' : ''
                    }`} />
                    {item.name}
                    {active && (
                      <div className="absolute right-3 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="flex-shrink-0 px-4 py-4">
              <button
                onClick={signOut}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Traiblix
            </h1>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    active ? 'text-blue-600 dark:text-blue-400' : ''
                  }`} />
                  {item.name}
                </Link>
              )
            })}
            <button
              onClick={() => {
                signOut()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center px-3 py-3 text-base font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  )
}