"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface CustomerProtectedRouteProps {
  children: React.ReactNode
}

export function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const { user, userType, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (userType === "business") {
        router.push("/business/home")
        return
      }
    }
  }, [user, userType, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!user || userType === "business") {
    return null
  }

  return <>{children}</>
}
