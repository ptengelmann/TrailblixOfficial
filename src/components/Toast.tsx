// src/components/Toast.tsx
// Toast notification system for better user feedback

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: Toast['type'], message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (type: Toast['type'], message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { id, type, message, duration }
    
    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-500" />
  }

  const colors = {
    success: 'bg-green-50 dark:bg-green-950/90 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800'
  }

  const textColors = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-amber-800 dark:text-amber-200',
    info: 'text-blue-800 dark:text-blue-200'
  }

  return (
    <div
      className={`pointer-events-auto transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${colors[toast.type]} backdrop-blur-sm shadow-lg`}>
        <div className="flex-shrink-0 mt-0.5">
          {icons[toast.type]}
        </div>
        <p className={`flex-1 text-sm font-medium ${textColors[toast.type]}`}>
          {toast.message}
        </p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}