import { ReactNode } from 'react'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navigation />
      
      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8 pt-20 md:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}