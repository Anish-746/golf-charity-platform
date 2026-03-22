'use client'

import { useState } from 'react'

/**
 * Hook for handling server action responses with error/success states
 * Allows forms to preserve state and display errors without redirects
 */
export function useServerAction<T = void>() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = async (
    action: () => Promise<{ success?: boolean; error?: string; data?: T }>
  ) => {
    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const result = await action()
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      if (result.data) {
        setData(result.data)
      }
      return { success: true, data: result.data }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    execute,
    isLoading,
    error,
    data,
    clearError,
  }
}
