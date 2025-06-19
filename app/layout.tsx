import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import ErrorBoundary from "@/components/error-boundary" // Import ErrorBoundary
import AccessDenied from "@/components/ui/AccessDenied" // Use AccessDenied as a simple fallback
import "./globals.css"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ErrorBoundary fallback={<AccessDenied message="Something went wrong. Please try again later." />}>
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
