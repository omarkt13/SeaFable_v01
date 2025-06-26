import { supabase } from "@/lib/supabase/client" // Use the directly exported supabase client
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
  return data
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from("host_profiles")
    .select(`
    *,
    host_business_settings (
      onboarding_completed,
      marketplace_enabled
    )
  `)
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error in getBusinessProfile:", error)
    return null
  }

  // Flatten the host_business_settings into the main profile object
  const businessProfile = data
    ? {
        ...data,
        onboarding_completed: data.host_business_settings?.onboarding_completed || false,
        marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
      }
    : null

  return businessProfile
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Error signing in:", error)
    throw error
  }
  return data
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export async function signUpUser(email: string, password: string, userType: "customer" | "business") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: userType,
      },
    },
  })

  if (error) {
    console.error("Error signing up:", error)
    throw error
  }
  return data
}

export async function resetPasswordForEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
  })

  if (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error("Error updating password:", error)
    throw error
  }
  return data
}

export async function signOutAndRedirect(userType: "customer" | "business") {
  try {
    await signOutUser() // Use the signOutUser function from this file

    // Redirect based on user type
    if (userType === "business") {
      window.location.href = "/business/login"
    } else {
      window.location.href = "/login"
    }
  } catch (error) {
    console.error("Error during sign out and redirect:", error)
    // Still redirect even if sign out fails
    window.location.href = "/"
  }
}
