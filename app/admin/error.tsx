'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-400 mb-2">
            Admin Page Error
          </h1>
          <p className="text-red-300 text-sm mb-4">
            {error.message || 'An unexpected error occurred loading the admin page'}
          </p>
          {error.digest && (
            <p className="text-red-300/70 text-xs mb-4">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => reset()}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try again
            </button>
            <a
              href="/dashboard"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
