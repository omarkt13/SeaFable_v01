import { supabase } from "@/lib/supabase" // Correct import for client-side supabase
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    console.error("Supabase client is not initialized.")
    return null
  }
  // ✅ FIXED: Changed table from "user_profiles" to "users" and column from "user_id" to "id"
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error.message)
    return null
  }
  return data as UserProfile
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  if (!supabase) {
    console.error("Supabase client is not initialized.")
    return null
  }
  // ✅ FIXED: Changed column from "user_id" to "id" for host_profiles
  const { data, error } = await supabase
    .from("host_profiles")
    .select(`
      *,
      host_business_settings (
        onboarding_completed,
        marketplace_enabled
      )
    `)
    .eq("id", userId) // Query by 'id' as it's the user's ID in host_profiles
    .single()

  if (error) {
    console.error("Error fetching business profile:", error.message)
    return null
  }

  // Ensure host_business_settings is correctly merged, handling potential null
  const businessProfileData = data as BusinessProfile
  return {
    ...businessProfileData,
    onboarding_completed: businessProfileData.host_business_settings?.onboarding_completed || false,
    marketplace_enabled: businessProfileData.host_business_settings?.marketplace_enabled || false,
  }
}

export async function signOut() {
  if (!supabase) {
    console.error("Supabase client is not initialized.")
    return { error: new Error("Supabase client not initialized.") }
  }
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error.message)
  }
  return { error }
}

// Re-export supabase for convenience if other files need it directly from auth-utils
export { supabase }
