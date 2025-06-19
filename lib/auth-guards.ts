import { getCurrentUser, getBusinessProfile, determineUserType } from "./auth-utils"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireCustomerAuth() {
  const user = await requireAuth()
  const userType = await determineUserType(user.id)

  if (userType !== "customer") {
    redirect("/business/login") // Redirect business users to business login
  }

  return user
}

export async function requireBusinessAuth() {
  const user = await requireAuth()
  const userType = await determineUserType(user.id)

  if (userType !== "business") {
    redirect("/login") // Redirect customers to regular login
  }

  const businessProfile = await getBusinessProfile(user.id)
  if (!businessProfile) {
    redirect("/business/register") // New business user needs to complete registration
  }

  return { user, businessProfile }
}

export async function requireCompleteBusinessProfile() {
  const { user, businessProfile } = await requireBusinessAuth()

  if (!businessProfile.onboarding_completed) {
    redirect("/business/onboarding")
  }

  return { user, businessProfile }
}
