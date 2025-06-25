import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import ErrorFallback from "@/components/ui/ErrorFallback"
import { MainNavbar } from "@/components/navigation/main-navbar" // Import the new MainNavbar
import "./globals.css"

export const metadata: Metadata = {
  title: "SeaFable - Marine Experiences Platform",
  description: "Discover and book unique marine experiences",
  generator: "v0.dev",
  keywords: ["marine", "experiences", "booking", "ocean"],
  authors: [{ name: "SeaFable Team" }],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider key="auth-provider">
            <div className="min-h-screen flex flex-col">
              <MainNavbar /> {/* Render the MainNavbar here */}
              <main className="flex-1 pt-16">
                {" "}
                {/* Add padding-top to account for fixed navbar height */}
                <ErrorBoundary
                  fallback={({ error, reset }) => (
                    <ErrorFallback error={error} reset={reset} message="An application error occurred." />
                  )}
                >
                  {children}
                </ErrorBoundary>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
