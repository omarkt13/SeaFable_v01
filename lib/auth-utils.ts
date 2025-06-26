import { supabase } from "@/lib/supabase" // Correct import for client-side supabase
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    console.error("Supabase client is not initialized.")
    return null
  }
  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

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
  const { data, error } = await supabase
    .from("host_profiles") // Assuming 'host_profiles' is the table for business profiles
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    console.error("Error fetching business profile:", error.message)
    return null
  }
  return data as BusinessProfile
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
