import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary"
import { Toaster } from "@/components/ui/toaster"
import { logDatabaseDiagnostics } from '@/lib/database-diagnostics'

// Only run database diagnostics in development when DEBUG_DB is set
// This prevents unnecessary auth/RLS errors on public pages like landing
if (process.env.NODE_ENV === 'development' && process.env.DEBUG_DB === 'true') {
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthErrorBoundary>
          <AuthProvider>
            <Toaster />
            {children}
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  )
}