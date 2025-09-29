// Comprehensive error handling utilities
import { DatabaseError, ApiResponse } from '@/types/api'
import { logger } from '@/lib/logger'

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): ApiResponse {
  logger.error('API Error occurred', 'API', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      data: { code: error.code }
    }
  }

  if (error instanceof Error) {
    // Handle specific database errors
    if (error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'Resource already exists'
      }
    }

    if (error.message.includes('not found')) {
      return {
        success: false,
        error: 'Resource not found'
      }
    }

    return {
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }
  }

  return {
    success: false,
    error: 'Unknown error occurred'
  }
}

// Async error wrapper for API handlers
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | ApiResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// Client-side error handler
export function handleClientError(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

// Logging utility
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ''

  logger.error(`${contextStr}Error occurred`, 'ERROR_HANDLER', {
    timestamp,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })

  // In production, you might want to send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, LogRocket, etc.
  }
}

// Type guard for checking if error is a database error
export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as DatabaseError).message === 'string'
  )
}