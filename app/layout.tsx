import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { ToastProvider } from "@/components/ui/toast-provider"
import { logDatabaseDiagnostics } from '@/lib/database-diagnostics'

// Run database diagnostics in development
if (process.env.NODE_ENV === 'development') {
  logDatabaseDiagnostics()
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SeaFable - Discover Amazing Water Adventures",
  description: "Book unique water experiences and adventures with verified hosts worldwide.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}