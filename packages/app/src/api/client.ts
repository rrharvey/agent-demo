import ky from 'ky'
import { z } from 'zod'

// Base API client instance
export const apiClient = ky.create({
  prefixUrl: 'http://localhost:5008/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  retry: 1,
})

// API error handling helper
export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Validation error for Zod schema validation failures
export class ValidationError extends Error {
  errors: z.ZodError

  constructor(errors: z.ZodError) {
    super('Response validation failed')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

// Helper function to validate and parse response data with a Zod schema
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error)
    }
    throw error
  }
}

// Helper function to handle API errors and validate responses with Zod
export async function handleApiResponse<T>(promise: any, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const data = await promise.json()
    return validateWithSchema(schema, data)
  } catch (error) {
    if (error instanceof ValidationError) {
      // Re-throw validation errors
      throw error
    }
    if (error instanceof Response) {
      const errorData = await error.text()
      try {
        // Try to parse error response as JSON
        const errorJson = JSON.parse(errorData)
        throw new ApiError(errorJson.message || 'An error occurred during the API request', error.status, errorJson)
      } catch (parseError) {
        // If JSON parsing fails, use the raw text
        throw new ApiError(errorData, error.status)
      }
    }
    throw error
  }
}
