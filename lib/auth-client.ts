import { createClient } from "@/lib/supabase/client"
import type { UserProfile, BusinessProfile } from "@/types/auth"
import type { User } from "@supabase/supabase-js"

const supabase = createClient() // Use the client-side Supabase instance

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error("Error getting current user:", error)
    return null
  }
  return user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
  return data
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from("host_profiles")
    .select(
      `
      *,
      host_business_settings (
        onboarding_completed,
        marketplace_enabled
      )
    `,
    )
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching business profile:", error)
    return null
  }

  const profile = {
    ...data,
    onboarding_completed: data.host_business_settings?.onboarding_completed || false,
    marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
  }
  return profile
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error("Error signing in:", error)
    throw error
  }
  return data
}

export async function signUpUser(email: string, password: string, userType: "customer" | "business") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { user_type: userType },
    },
  })
  if (error) {
    console.error("Error signing up:", error)
    throw error
  }
  return data
}
