"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AccessDenied } from "@/components/ui/AccessDenied" // Assuming AccessDenied is a client component

export function BusinessProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userType, isLoading } = useAuth() // Destructure userType from useAuth
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to business login
        router.replace("/business/login")
      } else if (userType !== "business") {
        // Logged in but not a business user, redirect to home page
        router.replace("/")
      }
    }
  }, [user, userType, isLoading, router]) // Add userType to dependency array

  if (isLoading) {
    // Show a loading spinner or placeholder while auth status is being determined
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user && userType === "business") {
    return <>{children}</>
  }

  // If user is not a business or not logged in, show AccessDenied (before redirect takes effect)
  // The useEffect above will handle the actual redirection.
  return <AccessDenied userType="business" message="You do not have access to the business dashboard." />
}
