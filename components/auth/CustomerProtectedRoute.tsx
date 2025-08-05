"use client"

import { supabase } from "@/lib/supabase"
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
        // Force logout of wrong user type for security
        const logout = async () => {
          await supabase.auth.signOut()
          router.push("/login")
        }
        logout()
        return;
      }
    }, 100);

    return () => clearTimeout(redirectTimeout);
  }, [user, userType, isLoading, router])

  // Show loading for a bit longer to handle auth state transitions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("CustomerProtectedRoute: No user found, redirecting to login")
    return <AccessDenied />
  }

  if (userType === "business") {
    console.log("CustomerProtectedRoute: Business user accessing customer area")
    return <AccessDenied message="This area is for customers only. Please use the business portal." />
  }

  console.log("CustomerProtectedRoute: Customer access granted for:", user.email)
  return <>{children}</>
}