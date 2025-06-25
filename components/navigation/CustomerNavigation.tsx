"use client"

import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"

export function CustomerNavigation() {
  const { user, userProfile, businessProfile, userType } = useAuth()

  const handleSignOut = async () => {
    await signOutAndRedirect(userType || "customer") // Use current userType for redirect
  }

  let dashboardLink = "/"
  let displayInitials = "U"
  let avatarSrc = "/placeholder.svg"

  if (user) {
    if (userType === "customer") {
      dashboardLink = "/dashboard"
      displayInitials =
        userProfile?.first_name?.charAt(0) + userProfile?.last_name?.charAt(0) || user?.email?.charAt(0) || "U"
      avatarSrc = userProfile?.avatar_url || "/placeholder.svg"
    } else if (userType === "business") {
      dashboardLink = "/business/home"
      // For business, use first two letters of business name or first letter of email
      const businessNameParts = businessProfile?.business_name?.split(" ")
      if (businessNameParts && businessNameParts.length > 1) {
        displayInitials = businessNameParts[0].charAt(0) + businessNameParts[1].charAt(0)
      } else if (businessNameParts && businessNameParts.length === 1) {
        displayInitials = businessNameParts[0].charAt(0)
      } else {
        displayInitials = user?.email?.charAt(0) || "B" // Fallback to 'B' for business
      }
      avatarSrc = businessProfile?.logo_url || "/placeholder.svg"
    }
  }

  // Calculate user initials for the dropdown menu
  let userInitials = "U"
  if (userProfile?.first_name && userProfile?.last_name) {
    userInitials = userProfile.first_name.charAt(0) + userProfile.last_name.charAt(0)
  } else if (user?.email) {
    userInitials = user.email.charAt(0).toUpperCase()
  }

  return null
}
