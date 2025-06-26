import { createClient } from "@/lib/client-supabase" // Corrected import path
import type { User, Session } from "@supabase/supabase-js"
import type { UserProfile, BusinessProfile } from "@/types/auth"

// Initialize Supabase client for client-side operations
const supabase = createClient()

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error.message)
      return { success: false, error: error.message, user: null, session: null }
    }

    return { success: true, user: data.user, session: data.session, error: null }
  } catch (error: any) {
    console.error("Sign in network error:", error.message)
    return { success: false, error: "Network error occurred", user: null, session: null }
  }
}

export async function signUpUser(email: string, password: string, userType: "customer" | "business") {
  try {
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
      console.error("Sign up error:", error.message)
      return { success: false, error: error.message, user: null, session: null }
    }

    return { success: true, user: data.user, session: data.session, error: null }
  } catch (error: any) {
    console.error("Sign up network error:", error.message)
    return { success: false, error: "Network error occurred", user: null, session: null }
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error: any) {
    console.error("Sign out network error:", error.message)
    return { success: false, error: "Network error occurred" }
  }
}

export async function getSession(): Promise<{ session: Session | null; user: User | null }> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    return { session, user: session?.user || null }
  } catch (error) {
    console.error("Error getting session:", error)
    return { session: null, user: null }
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
    if (error) throw error
    return data as UserProfile
  } catch (error) {
    console.error("Error fetching user profile:", error)
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
      .eq("id", userId)
      .single()

    if (error) throw error

    const profile = {
      ...data,
      onboarding_completed: data.host_business_settings?.onboarding_completed || false,
      marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
    }
    return profile as BusinessProfile
  } catch (error) {
    console.error("Error fetching business profile:", error)
    return null
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
    })
    if (error) throw error
    return { success: true, message: "Password reset email sent." }
  } catch (error: any) {
    console.error("Error sending password reset email:", error.message)
    return { success: false, error: error.message || "Failed to send password reset email." }
  }
}

export async function updatePassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return { success: true, message: "Password updated successfully." }
  } catch (error: any) {
    console.error("Error updating password:", error.message)
    return { success: false, error: error.message || "Failed to update password." }
  }
}
