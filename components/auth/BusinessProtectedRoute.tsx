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
    // Add a small delay to ensure auth context is fully initialized
    const timeoutId = setTimeout(() => {
      if (!isLoading) {
        if (!user) {
          router.push("/business/login")
          return
        }

        if (userType !== "business") {
          router.push("/business/register")
          return
        }
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [user, userType, isLoading, router])

  if (isLoading) {
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