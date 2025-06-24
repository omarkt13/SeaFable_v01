"use client" // Error boundaries must be Client Components

import { Component, type ErrorInfo, type ReactNode } from "react"

interface ErrorBoundaryProps {
  // Fallback can now be a function that receives the error and a reset function
  fallback?: (props: { error: Error | null; reset: () => void }) => ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null // Store the actual error object
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI, and store the error
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error object directly for better inspection
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  // Method to reset the error boundary state
  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // If a fallback function is provided, call it with the error and reset function
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({ error: this.state.error, reset: this.resetErrorBoundary })
      }
      // Default fallback UI if no fallback function is provided
      // Use String(this.state.error) for robust display of any error object
      const errorMessage = this.state.error ? String(this.state.error) : "An unknown error occurred."
      return (
        <div className="flex min-h-screen items-center justify-center bg-red-100 text-red-800 p-4 flex-col">
          <h2 className="text-xl font-semibold">Oops, something went wrong!</h2>
          <p className="mt-2">{errorMessage}</p> {/* Display the stringified error */}
          <button
            type="button"
            onClick={this.resetErrorBoundary}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try again?
          </button>
        </div>
      )
    }

    // Return children components in case of no error
    return this.props.children
  }
}
