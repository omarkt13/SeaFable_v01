"use client"

import { getClientSupabase } from "@/lib/client-supabase"
import type { User, Session } from "@supabase/supabase-js"
import type { UserProfile, BusinessProfile } from "@/types/auth"

const supabase = getClientSupabase()

export async function signInUser(
  email: string,
  password: string,
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error.message)
      return { user: null, session: null, error: new Error(error.message) }
    }

    return { user: data.user, session: data.session, error: null }
  } catch (error: any) {
    console.error("Sign in network error:", error.message)
    return { user: null, session: null, error: new Error("Network error occurred") }
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Assuming a user always has one user profile, but using maybeSingle for robustness
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()
  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
  return data as UserProfile
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  // Use maybeSingle to handle cases where a user might not have a business profile
  const { data, error } = await supabase
    .from("host_profiles")
    .select("*, host_business_settings(*)")
    .eq("user_id", userId)
    .maybeSingle() // Changed from .single()
  if (error) {
    console.error("Error fetching business profile:", error)
    return null
  }
  return data as BusinessProfile
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function signInWithEmail(email: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithOtp({ email })
  return { error }
}

export async function verifyOtp(
  email: string,
  token: string,
): Promise<{ session: Session | null; error: Error | null }> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" })
  return { session: data.session, error }
}

export async function updatePassword(password: string): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await supabase.auth.updateUser({ password })
  return { user: data.user, error }
}

export async function signUpNewUser(
  email: string,
  password: string,
): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user, error }
}

export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) {
    console.error("Error getting current session:", error)
    return null
  }
  return session
}

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
