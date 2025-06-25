"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryProps {
  fallback?: (props: { error: Error | null; reset: () => void; errorId: string }) => ReactNode
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: "",
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    }

    // Log error details
    console.error("Error caught by ErrorBoundary:", errorDetails)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Send to error reporting service (implement as needed)
    this.reportError(errorDetails)

    this.setState({ errorInfo })
  }

  private reportError = async (errorDetails: any) => {
    try {
      // Implement error reporting to your service
      if (process.env.NODE_ENV === "production") {
        // Example: send to error reporting service
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorDetails)
        // })
      }
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }
  }

  resetErrorBoundary = () => {
    this.retryCount++
    this.setState({
      hasError: false,
      error: null,
      errorId: "",
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({
          error: this.state.error,
          reset: this.resetErrorBoundary,
          errorId: this.state.errorId,
        })
      }

      // Default error UI
      const canRetry = this.retryCount < this.maxRetries
      const isNetworkError = this.state.error.message.includes("fetch") || this.state.error.message.includes("network")
      const isChunkError =
        this.state.error.message.includes("ChunkLoadError") || this.state.error.message.includes("Loading chunk")

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Something went wrong</CardTitle>
              <CardDescription className="text-gray-600">
                {isNetworkError && "Network connection error. Please check your internet connection."}
                {isChunkError && "Application update detected. Please refresh the page."}
                {!isNetworkError && !isChunkError && "An unexpected error occurred. Our team has been notified."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && (
                <div className="rounded-md bg-gray-100 p-3">
                  <p className="text-xs font-mono text-gray-700 break-all">{this.state.error.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Error ID: {this.state.errorId}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button onClick={this.resetErrorBoundary} className="w-full" variant="default">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </Button>
                )}

                <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>

                {isChunkError && (
                  <Button onClick={() => window.location.reload()} variant="secondary" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error("Manual error report:", { error, errorInfo })
    // Could integrate with error reporting service
  }
}
