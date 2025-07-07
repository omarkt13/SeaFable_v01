"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign-in error:", error)
    return { success: false, message: error.message }
  }

  return { success: true, message: "Signed in successfully!" }
}

export async function signUp(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        user_type: "customer", // Default to customer for general sign-up
      },
    },
  })

  if (error) {
    console.error("Sign-up error:", error)
    return { success: false, message: error.message }
  }

  // Insert into public.users table
  if (data.user) {
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        email: data.user.email,
        first_name: firstName,
        last_name: lastName,
        user_type: "customer",
      },
    ])

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Optionally, handle rollback or notify user of partial success
      return { success: false, message: "Account created, but profile could not be saved." }
    }
  }

  return { success: true, message: "Signed up successfully! Check your email for a confirmation link." }
}

export async function businessSignUp(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const businessName = formData.get("businessName") as string
  const hostType = formData.get("hostType") as string
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        business_name: businessName,
        host_type: hostType,
        user_type: "business", // Set user type to business
      },
    },
  })

  if (error) {
    console.error("Business sign-up error:", error)
    return { success: false, message: error.message }
  }

  // Insert into public.host_profiles table
  if (data.user) {
    const { error: profileError } = await supabase.from("host_profiles").insert([
      {
        id: data.user.id, // Use user.id as the primary key for host_profiles
        user_id: data.user.id, // Also set user_id for consistency
        email: data.user.email,
        business_name: businessName,
        name: businessName, // Use businessName as default for 'name'
        host_type: hostType,
      },
    ])

    if (profileError) {
      console.error("Host profile creation error:", profileError)
      return { success: false, message: "Business account created, but host profile could not be saved." }
    }

    // Also create an entry in host_business_settings
    const { error: settingsError } = await supabase.from("host_business_settings").insert([
      {
        host_profile_id: data.user.id,
        onboarding_completed: false,
        marketplace_enabled: false,
      },
    ])

    if (settingsError) {
      console.error("Host business settings creation error:", settingsError)
      return { success: false, message: "Business account created, but business settings could not be saved." }
    }
  }

  return { success: true, message: "Business account created! Check your email for a confirmation link." }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign out error:", error)
    return { success: false, message: error.message }
  }

  redirect("/login")
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${headers().get("origin")}/update-password`, // Assuming you have an update-password page
  })

  if (error) {
    console.error("Password reset request error:", error)
    return { success: false, message: error.message }
  }

  return { success: true, message: "If an account with that email exists, a password reset link has been sent." }
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { success: false, error: "Email is required." }
  }

  const supabase = createClient()

  try {
    // In a real application, you would send a password reset email here.
    // For this demo, we'll simulate a successful send.
    // Example: const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` });
    // For now, we'll just simulate a delay and success.

    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    // Check if the email exists in the users table (optional, for better UX)
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

    if (userError || !user) {
      // For security, it's often better to give a generic success message
      // even if the email doesn't exist, to prevent email enumeration.
      console.warn(`Password reset requested for non-existent or errored user: ${email}`)
      return { success: true, message: "If an account with that email exists, a password reset link has been sent." }
    }

    // Simulate sending the email
    console.log(`Simulating password reset email sent to: ${email}`)

    return { success: true, message: "If an account with that email exists, a password reset link has been sent." }
  } catch (error: any) {
    console.error("Error sending password reset email:", error)
    return { success: false, error: error.message || "Failed to send password reset email." }
  }
}
