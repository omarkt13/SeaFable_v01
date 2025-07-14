"use client" // Error boundaries must be Client Components

import { Component, type ErrorInfo, type ReactNode } from "react"

interface ErrorBoundaryProps {
  // Fallback can now be a function that receives the error and a reset function
  fallback?: (props: { error: Error | null; reset: () => void }) => ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const reset = () => {
        this.setState({ hasError: false, error: null })
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          reset={reset} 
          message={this.props.message || "An application error occurred."} 
        />
      )
    }

    return this.props.children
  }
}