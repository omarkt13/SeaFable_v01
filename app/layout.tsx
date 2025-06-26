import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import ErrorFallback from "@/components/ui/ErrorFallback"
import "./globals.css"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {/* Pass a function to the fallback prop to receive the error and reset function */}
            <ErrorBoundary
              fallback={({ error, reset }) => (
                <ErrorFallback error={error} reset={reset} message="An application error occurred." />
              )}
            >
              {children}
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
