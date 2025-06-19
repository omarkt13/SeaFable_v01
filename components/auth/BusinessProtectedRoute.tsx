"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AccessDenied } from "@/components/ui/AccessDenied" // Assuming AccessDenied is a client component

export function BusinessProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.userType !== "business")) {
      // If not loading and no user, or user is not a business, redirect to login
      router.replace("/business/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    // Optionally render a loading spinner or placeholder while auth status is being determined
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  }

  if (user && user.userType === "business") {
    return <>{children}</>
  }

  // If user is not a business or not logged in, show AccessDenied (before redirect takes effect)
  // The useEffect above will handle the actual redirection.
  return <AccessDenied userType="business" message="You do not have access to the business dashboard." />
}
