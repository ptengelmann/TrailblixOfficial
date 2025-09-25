import { ReactNode } from 'react'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navigation />
      
      {/* Main Content */}
      <div className="md:pl-72 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8 pt-20 md:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}