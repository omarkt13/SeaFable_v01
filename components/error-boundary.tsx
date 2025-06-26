"use client"

import React, { type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: (props: ErrorFallbackProps) => ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorFallbackProps {
  error?: Error
  reset: () => void
  message?: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and potential error tracking service
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    this.setState({
      hasError: true,
      error,
      errorInfo,
    })

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // You can integrate with Sentry, LogRocket, etc. here
      this.logErrorToService(error, errorInfo)
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Placeholder for error logging service
    console.log("Logging error to external service:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })
  }

  private reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.reset,
        })
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} message="An unexpected error occurred" />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset, message }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Oops! Something went wrong</CardTitle>
          <CardDescription className="text-gray-600">
            {message || "We're sorry, but something unexpected happened. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && error && (
            <div className="rounded-md bg-red-50 p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Error Details (Development Mode)</h4>
              <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">{error.stack}</pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={reset} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center pt-2">
            If this problem persists, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for manually triggering error boundaries
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    console.error("Manual error trigger:", error, errorInfo)
    throw error
  }
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (props: ErrorFallbackProps) => ReactNode,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default ErrorBoundary
