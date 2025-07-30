
"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

interface CustomerProtectedRouteProps {
  children: React.ReactNode
}

export function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const { user, userType, isLoading } = useAuth()
  const router = useRouter()

  useIsomorphicLayoutEffect(() => {
    // Add a small buffer to prevent redirect loops during auth state changes
    const redirectTimeout = setTimeout(() => {
      if (!isLoading && !user) {
        console.log("CustomerProtectedRoute: Redirecting to login - no user");
        router.push("/login");
        return;
      }

      if (!isLoading && user && userType && userType !== "customer") {
        console.log("CustomerProtectedRoute: Redirecting to register - wrong user type:", userType);
        router.push("/register");
        return;
      }
    }, 100);

    return () => clearTimeout(redirectTimeout);
  }, [user, userType, isLoading, router])

  // Show loading for a bit longer to handle auth state transitions
  if (isLoading || (user && !userType)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render children until we have confirmed auth state
  if (!user || userType !== "customer") {
    return null
  }

  return <>{children}</>
}
