// src/pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ToastProvider } from '@/components/Toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <ToastProvider>
            <Component {...pageProps} />
          </ToastProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}