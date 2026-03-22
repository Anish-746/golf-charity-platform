'use client'

import React, { PropsWithChildren } from 'react'

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: (error: Error, reset: () => void) => React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Error boundary caught:', error)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(
          this.state.error,
          () => this.setState({ hasError: false, error: null })
        ) || (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <h1 className="text-lg font-bold text-red-400 mb-2">
                  Something went wrong
                </h1>
                <p className="text-red-300 text-sm mb-4">
                  {this.state.error.message || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
