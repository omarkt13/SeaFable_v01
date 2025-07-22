"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface BusinessProtectedRouteProps {
  children: React.ReactNode
}

export function BusinessProtectedRoute({ children }: BusinessProtectedRouteProps) {
  const { user, userType, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("BusinessProtectedRoute - Auth State:", { 
      user: user?.id, 
      userType, 
      isLoading 
    });

    if (!isLoading) {
      if (!user) {
        console.log("BusinessProtectedRoute - No user, redirecting to login");
        router.push("/business/login")
        return
      }

      if (userType !== "business") {
        console.log("BusinessProtectedRoute - User type is not business:", userType);
        router.push("/business/register")
        return
      }
    }
  }, [user, userType, isLoading, router])

  if (isLoading) {
    console.log("BusinessProtectedRoute - Loading...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user || userType !== "business") {
    console.log("BusinessProtectedRoute - Access denied:", { user: !!user, userType });
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

  console.log("BusinessProtectedRoute - Access granted");
  return <>{children}</>
}
