import { createClient } from "@/lib/supabase/client"
import type { UserProfile, BusinessProfile } from "@/types/auth"

// Get a Supabase client instance
export function getSupabase() {
  return createClient()
}

// Export the client instance for backward compatibility
export const supabase = getSupabase()

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
  return data
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("host_profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error in getBusinessProfile:", error)
    return null
  }
  return data
}

export async function signInUser(email: string, password: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Error signing in:", error)
    throw error
  }
  return data
}

export async function signOut() {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export async function signUpUser(email: string, password: string, userType: "customer" | "business") {
  const supabase = getSupabase()
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
  const supabase = getSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
  })

  if (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

export async function updatePassword(password: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error("Error updating password:", error)
    throw error
  }
  return data
}

export async function signOutAndRedirect(userType: "customer" | "business") {
  try {
    await signOut()

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
