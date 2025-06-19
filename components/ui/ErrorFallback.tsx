"use client"

import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorFallbackProps {
  error?: Error & { digest?: string }
  reset?: () => void
  message?: string
}

export default function ErrorFallback({ error, reset, message }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h1>
          <p className="text-gray-600 mb-6">
            {message || "We're sorry, but an unexpected error occurred. Please try again."}
          </p>

          {error && (
            <div className="bg-gray-100 p-4 rounded-md text-left text-sm text-gray-700 mb-6">
              <p className="font-semibold">Error Details:</p>
              <p className="break-words">{error.message}</p>
              {error.digest && <p className="text-xs text-gray-500 mt-1">Digest: {error.digest}</p>}
            </div>
          )}

          <div className="space-y-3">
            {reset && (
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            )}
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
