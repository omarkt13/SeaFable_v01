import { supabaseClient } from "@/lib/supabase-client"
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseClient.from("users").select("*").eq("id", userId).single()
  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
  return data
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabaseClient.from("host_profiles").select("*").eq("id", userId).single()
  if (error) {
    console.error("Error fetching business profile:", error)
    return null
  }
  return data
}

export async function signOut() {
  const { error } = await supabaseClient.auth.signOut()
  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
  if (error) {
    console.error("Error signing in:", error)
    throw error
  }
  return data
}
