"use client"


import { supabase } from "@/lib/supabase"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

interface BusinessProtectedRouteProps {
  children: React.ReactNode
}

export function BusinessProtectedRoute({ children }: BusinessProtectedRouteProps) {
  const { user, userType, isLoading } = useAuth()
  const router = useRouter()

  useIsomorphicLayoutEffect(() => {
    // Add a small buffer to prevent redirect loops during auth state changes
    const redirectTimeout = setTimeout(() => {
      if (!isLoading && !user) {
        router.push("/business/login");
        return;
      }

      if (!isLoading && user && userType && userType !== "business") {
        // Force logout of wrong user type for security
        const logout = async () => {
          await supabase.auth.signOut()
          router.push("/business/login")
        }
        logout()
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

  if (!user || userType !== "business") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">No authenticated user found</p>
          <button 
            onClick={() => router.push("/business/login")}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}