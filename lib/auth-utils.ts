import { supabase } from "@/lib/supabase" // This is the client-side instance
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error in getUserProfile:", error)
    // Do not throw error here, return null to allow AuthProvider to handle missing profile gracefully
    return null
  }
  return data
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase.from("host_profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error in getBusinessProfile:", error)
    // Do not throw error here, return null to allow AuthProvider to handle missing profile gracefully
    return null
  }
  return data
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Error signing in:", error)
    throw error
  }
  return data
}

export async function signOut() {
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
