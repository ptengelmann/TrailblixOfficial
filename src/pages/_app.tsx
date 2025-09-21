// src/pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/Toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </AuthProvider>
  )
}