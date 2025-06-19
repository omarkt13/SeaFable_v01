"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface CustomerProtectedRouteProps {
  children: React.ReactNode
}

export function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const { user, userType, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (userType === "business") {
        router.push("/business/dashboard")
        return
      }

      if (userType !== "customer") {
        router.push("/login")
        return
      }
    }
  }, [user, userType, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!user || userType !== "customer") {
    return null
  }

  return <>{children}</>
}
