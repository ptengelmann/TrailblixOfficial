// Enterprise-grade logging utility
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    const logEntry = this.formatMessage(level, message, context, data)

    // In development, use console with colors
    if (this.isDevelopment) {
      const contextStr = context ? `[${context}] ` : ''
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m'  // red
      }
      const reset = '\x1b[0m'

      console[level === 'debug' ? 'log' : level](
        `${colors[level]}${logEntry.timestamp} [${level.toUpperCase()}] ${contextStr}${message}${reset}`,
        data ? data : ''
      )
      return
    }

    // In production, send to external service (placeholder for now)
    if (this.isProduction) {
      // TODO: Send to monitoring service (Sentry, LogRocket, DataDog, etc.)
      // For now, only log errors and warnings to console
      if (level === 'error' || level === 'warn') {
        console[level](JSON.stringify(logEntry))
      }

      // Send to external monitoring service
      this.sendToMonitoringService(logEntry)
    }
  }

  private sendToMonitoringService(logEntry: LogEntry): void {
    // Placeholder for external monitoring service integration
    // Examples: Sentry, LogRocket, DataDog, New Relic, etc.

    if (logEntry.level === 'error') {
      // In a real implementation, you would send to Sentry:
      // Sentry.captureException(new Error(logEntry.message), {
      //   tags: { context: logEntry.context },
      //   extra: logEntry.data
      // })
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data)
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data)
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data)
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log('error', message, context, data)
  }

  // Convenience method for API request logging
  apiRequest(method: string, url: string, statusCode?: number, responseTime?: number): void {
    this.info(
      `${method} ${url} ${statusCode ? `- ${statusCode}` : ''}${responseTime ? ` (${responseTime}ms)` : ''}`,
      'API',
      { method, url, statusCode, responseTime }
    )
  }

  // Convenience method for database operation logging
  dbOperation(operation: string, table: string, duration?: number, error?: unknown): void {
    if (error) {
      this.error(`DB ${operation} failed on ${table}`, 'DATABASE', { operation, table, duration, error })
    } else {
      this.debug(`DB ${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`, 'DATABASE', { operation, table, duration })
    }
  }

  // Convenience method for user action logging
  userAction(userId: string, action: string, details?: unknown): void {
    this.info(`User action: ${action}`, 'USER_ACTION', { userId, action, details })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for external usage
export type { LogLevel, LogEntry }