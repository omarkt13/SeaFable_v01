"use client"

import { supabase } from "@/lib/supabase/client" // Import the directly exported supabase client
import type { UserProfile, BusinessProfile } from "@/types/auth"
import { redirect } from "next/navigation"

export async function signInUser(email: string, password?: string) {
  if (password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  } else {
    // Handle passwordless sign-in if applicable
    throw new Error("Passwordless sign-in not implemented yet.")
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
  if (error) throw error
  return data
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  // Redirect to home page after sign out
  redirect("/")
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
    return data as UserProfile
  } catch (error) {
    console.error("Exception fetching user profile:", error)
    return null
  }
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  try {
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
    return profile as BusinessProfile
  } catch (error) {
    console.error("Exception fetching business profile:", error)
    return null
  }
}
