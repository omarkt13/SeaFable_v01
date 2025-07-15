"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      {resetError && (
        <Button onClick={resetError} variant="outline">
          Try again
        </Button>
      )}
    </div>
  )
}
