// src/lib/validation.ts
// Reusable validation utilities for forms

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validators = {
  email: (email: unknown): ValidationResult => {
    if (typeof email !== 'string' || !email) {
      return { isValid: false, error: 'Email is required' }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' }
    }
    return { isValid: true }
  },

  password: (password: unknown): ValidationResult => {
    if (typeof password !== 'string' || !password) {
      return { isValid: false, error: 'Password is required' }
    }
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' }
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' }
    }
    return { isValid: true }
  },

  passwordMatch: (password: unknown, confirmPassword: unknown): ValidationResult => {
    if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
      return { isValid: false, error: 'Both passwords are required' }
    }
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' }
    }
    return { isValid: true }
  },

  required: (value: unknown, fieldName: string = 'This field'): ValidationResult => {
    if (typeof value !== 'string' || !value || value.trim() === '') {
      return { isValid: false, error: `${fieldName} is required` }
    }
    return { isValid: true }
  },

  url: (url: unknown): ValidationResult => {
    if (typeof url !== 'string' || !url) return { isValid: true } // Optional field

    try {
      new URL(url)
      return { isValid: true }
    } catch {
      return { isValid: false, error: 'Invalid URL format' }
    }
  },

  fileSize: (file: File, maxSizeMB: number = 5): ValidationResult => {
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
    }
    return { isValid: true }
  },

  fileType: (file: File, allowedTypes: string[]): ValidationResult => {
    const isAllowed = allowedTypes.some(type => file.type.includes(type))
    if (!isAllowed) {
      return { 
        isValid: false, 
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
      }
    }
    return { isValid: true }
  }
}

// Utility to validate multiple fields
export function validateFields(
  fields: { [key: string]: unknown },
  rules: { [key: string]: (value: unknown) => ValidationResult }
): { [key: string]: string } {
  const errors: { [key: string]: string } = {}
  
  Object.entries(rules).forEach(([field, validate]) => {
    const result = validate(fields[field])
    if (!result.isValid && result.error) {
      errors[field] = result.error
    }
  })
  
  return errors
}