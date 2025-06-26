"use client"

import { createClient } from "@/lib/supabase/client" // Updated import path
import type { AuthError } from "@supabase/supabase-js"
import type { UserProfile, BusinessProfile } from "@/types/auth"

const supabase = createClient()

// Removed signInUser as it's now handled by AuthContext's login function

export async function getClientUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle() // Use maybeSingle
    if (error) {
      console.error("Error fetching client user profile:", error)
      return null
    }
    return data as UserProfile
  } catch (error) {
    console.error("Network error fetching client user profile:", error)
    return null
  }
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  try {
    const { data, error } = await supabase
      .from("host_profiles")
      .select(`
        *,
        host_business_settings (
          onboarding_completed,
          marketplace_enabled
        )
      `)
      .eq("user_id", userId) // Ensure it's user_id
      .maybeSingle() // Use maybeSingle

    if (error) {
      console.error("Error fetching client business profile:", error)
      return null
    }

    const profile = data
      ? {
          ...data,
          onboarding_completed: data.host_business_settings?.onboarding_completed || false,
          marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
        }
      : null
    return profile as BusinessProfile
  } catch (error) {
    console.error("Network error fetching client business profile:", error)
    return null
  }
}

export async function signOutClient(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}
