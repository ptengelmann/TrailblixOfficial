// Zod validation schemas for API requests and forms
import { z } from 'zod'

// User profile schemas
export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  current_role: z.string().min(1, 'Current role is required').max(100),
  location: z.string().max(100).optional(),
  linkedin_url: z.string().url({ message: 'Invalid LinkedIn URL' }).optional().or(z.literal('')),
  github_url: z.string().url({ message: 'Invalid GitHub URL' }).optional().or(z.literal('')),
  portfolio_url: z.string().url({ message: 'Invalid portfolio URL' }).optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  years_experience: z.number().min(0).max(50).optional(),
})

// Career objectives schema
export const careerObjectivesSchema = z.object({
  target_role: z.string().min(1, 'Target role is required').max(100),
  target_industry: z.string().max(100).optional(),
  career_stage: z.enum(['entry', 'mid', 'senior', 'executive']),
  primary_goal: z.enum(['job_search', 'skill_development', 'career_change', 'promotion']),
  timeline: z.enum(['immediate', 'short', 'medium', 'long']),
  work_preference: z.enum(['remote', 'hybrid', 'onsite', 'flexible']),
  salary_expectations: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().length(3, { message: 'Currency must be 3 characters' }).default('USD')
  }).optional()
})

// Job search filters schema
export const jobSearchFiltersSchema = z.object({
  query: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  remote: z.boolean().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contract']).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior']).optional(),
  page: z.number().min(1).optional(),
  per_page: z.number().min(1, { message: 'Per page must be at least 1' }).max(100, { message: 'Per page cannot exceed 100' }).optional()
})

// Job interaction schema
export const jobInteractionSchema = z.object({
  action: z.enum(['create', 'list', 'update', 'delete']),
  job_id: z.string().min(1).optional(),
  job_data: z.record(z.string(), z.unknown()).optional(),
  interaction_type: z.enum(['viewed', 'saved', 'applied', 'dismissed']).optional(),
  generate_ai_analysis: z.boolean().optional(),
  limit: z.number().min(1, { message: 'Limit must be at least 1' }).max(100, { message: 'Limit cannot exceed 100' }).optional()
})

// Resume analysis schema
export const resumeAnalysisSchema = z.object({
  resumeText: z.string().min(50, 'Resume text too short').max(50000, 'Resume text too long'),
  targetRole: z.string().max(100).optional(),
  careerStage: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  industryFocus: z.string().max(100).optional()
})

// Career progress schemas
export const milestoneUpdateSchema = z.object({
  milestone_id: z.string().min(1),
  milestone_updates: z.object({
    current_value: z.number().min(0).optional(),
    target_value: z.number().min(0).optional(),
    status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional()
  })
})

export const activityTrackingSchema = z.object({
  action: z.enum(['track_activity', 'get_summary', 'update_milestone', 'generate_insights']),
  activity_type: z.string().max(50).optional(),
  activity_data: z.record(z.string(), z.unknown()).optional(),
  milestone_id: z.string().optional(),
  milestone_updates: z.object({
    current_value: z.number().min(0).optional(),
    target_value: z.number().min(0).optional(),
    status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional()
  }).optional()
})

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

// Utility function to validate data
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err) =>
          `${String(err.path.join('.'))}): ${err.message}`
        )
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// Type exports for use in components
export type ProfileFormData = z.infer<typeof profileSchema>
export type CareerObjectivesFormData = z.infer<typeof careerObjectivesSchema>
export type JobSearchFilters = z.infer<typeof jobSearchFiltersSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>