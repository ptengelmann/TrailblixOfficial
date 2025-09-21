import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Menu, X, ArrowRight, BarChart3, Users, Zap, Link2, Building2, Info, Cog, Phone } from 'lucide-react'

interface NavbarProps {
  variant?: 'marketing' | 'app'
}

export default function Navbar({ variant = 'marketing' }: NavbarProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'app') {
    return null
  }

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name)
  }

  const productDropdownItems = [
    {
      title: 'Analytics Dashboard',
      description: 'Track your performance metrics in real-time',
      href: '#analytics',
      icon: BarChart3
    },
    {
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your team',
      href: '#collaboration',
      icon: Users
    },
    {
      title: 'Automation Tools',
      description: 'Automate repetitive tasks and save time',
      href: '#automation',
      icon: Zap
    },
    {
      title: 'Integrations',
      description: 'Connect with your favorite tools',
      href: '#integrations',
      icon: Link2
    }
  ]

  const companyDropdownItems = [
    { title: 'About Us', href: '#about', description: 'Learn about our mission and values', icon: Building2 },
    { title: 'How It Works', href: '#how-it-works', description: 'Discover the magic behind Traiblix', icon: Info },
    { title: 'Careers', href: '#careers', description: 'Join our growing team', icon: Users },
    { title: 'Contact', href: '#contact', description: 'Get in touch with us', icon: Phone }
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm' 
          : 'bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            Traiblix
          </Link>
          
          <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => toggleDropdown('product')}
                className="flex items-center gap-1 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
              >
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'product' && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 gap-1">
                    {productDropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white">
                            {item.title}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {item.description}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleDropdown('company')}
                className="flex items-center gap-1 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
              >
                Company
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'company' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'company' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 gap-1">
                    {companyDropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link 
              href="#features"
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Features
            </Link>
            
            <Link 
              href="#pricing"
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <div className="space-y-1">
              <button
                onClick={() => toggleDropdown('mobile-product')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span>Product</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-product' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-product' && (
                <div className="pl-4 space-y-1">
                  {productDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setActiveDropdown(null)
                      }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <item.icon className="w-5 h-5 mt-0.5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => toggleDropdown('mobile-company')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span>Company</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-company' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-company' && (
                <div className="pl-4 space-y-1">
                  {companyDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setActiveDropdown(null)
                      }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <item.icon className="w-5 h-5 mt-0.5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {item.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Features
            </Link>
            
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Pricing
            </Link>

            <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800 mt-4">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 text-center rounded-lg font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-slate-700 dark:text-slate-300 text-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 text-center rounded-lg font-medium"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}