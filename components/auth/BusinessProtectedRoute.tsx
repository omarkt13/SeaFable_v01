"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface BusinessProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export function BusinessProtectedRoute({ children, requireOnboarding = true }: BusinessProtectedRouteProps) {
  const { user, userType, loading, businessProfile } = useAuth() // Get businessProfile directly from useAuth
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      // Still loading auth state, do nothing yet
      return
    }

    if (!user) {
      // No user, redirect to business login
      router.push("/business/login")
      return
    }

    if (userType === "customer") {
      // User is a customer, redirect to customer dashboard
      router.push("/dashboard")
      return
    }

    if (userType !== "business") {
      // User is not a business type (e.g., null or undefined), redirect to business login
      router.push("/business/login")
      return
    }

    // If business user, check onboarding status
    if (requireOnboarding && !businessProfile?.onboarding_completed) {
      // Onboarding required and not completed, redirect to onboarding page
      router.push("/business/onboarding")
      return
    }
    // If all checks pass, allow access to the children
  }, [user, userType, loading, businessProfile, requireOnboarding, router]) // Depend on businessProfile

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // If user is not a business or onboarding is not complete when required,
  // we return null here because the useEffect above will handle the redirect.
  // This prevents rendering protected content before redirect.
  if (!user || userType !== "business" || (requireOnboarding && !businessProfile?.onboarding_completed)) {
    return null
  }

  return <>{children}</>
}
