"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context" // Use the Supabase-based useAuth
import { useUserProfile } from "@/context/UserProfileContext" // Use the Supabase-based useUserProfile

interface CustomerProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children, requireOnboarding = true }) => {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth() // Get user, isLoading, isAuthenticated from useAuth
  const { userProfile, isLoading: profileLoading } = useUserProfile() // Get userProfile, isLoading from useUserProfile

  const isLoading = authLoading || profileLoading // Combined loading state

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    const userType = userProfile?.user_type || user?.role // Prefer userProfile type, fallback to auth user role

    if (!userType) {
      // User type not yet available, wait or handle
      return
    }

    if (userType === "customer") {
      if (requireOnboarding && !userProfile?.onboarding_completed) {
        router.push("/onboarding")
        return
      }
      // If customer and onboarding is complete (or not required), allow access
      return
    }

    // Redirect non-customer/non-admin users
    if (userType !== "admin" && userType !== "customer") {
      router.push("/") // Or a more specific unauthorized page
    }
  }, [user, isAuthenticated, userProfile, router, isLoading, requireOnboarding])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If authenticated and user type is customer (and onboarding is met if required)
  if (isAuthenticated && (userProfile?.user_type === "customer" || user?.role === "customer")) {
    if (requireOnboarding && !userProfile?.onboarding_completed) {
      return null // Redirect handled by useEffect
    }
    return <>{children}</>
  }

  // If authenticated and user type is admin (allow access to all routes for admin)
  if (isAuthenticated && (userProfile?.user_type === "admin" || user?.role === "admin")) {
    return <>{children}</>
  }

  // If unauthenticated or not the correct user type, redirect is handled by useEffect
  return null
}

export default CustomerProtectedRoute
