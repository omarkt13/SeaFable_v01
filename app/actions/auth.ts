"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUpBusiness(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const businessName = formData.get("businessName") as string
  const contactName = formData.get("contactName") as string
  const phone = formData.get("phone") as string
  const location = formData.get("location") as string

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: "business",
          business_name: businessName,
          contact_name: contactName,
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user" }
    }

    // 2. Create host profile
    const { error: profileError } = await supabase
      .from("host_profiles")
      .insert({
        id: authData.user.id,
        user_id: authData.user.id,
        name: businessName,
        business_name: businessName,
        contact_name: contactName,
        email: email,
        phone: phone,
        location: location,
        host_type: "business",
        years_experience: 0,
        rating: 0,
        total_reviews: 0,
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Continue anyway, profile can be created later
    }

    // 3. Create business settings
    const { error: settingsError } = await supabase
      .from("host_business_settings")
      .insert({
        host_profile_id: authData.user.id,
        onboarding_completed: false,
        marketplace_enabled: true,
      })

    if (settingsError) {
      console.error("Settings creation error:", settingsError)
      // Continue anyway, settings can be created later
    }

    return { success: true, data: authData }
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signInUser(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return { success: false, error: error.message }
    }

    // Check if user has business profile
    const { data: hostProfile } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .single()

    if (hostProfile) {
      revalidatePath("/business/home")
      redirect("/business/home")
    } else {
      revalidatePath("/dashboard")
      redirect("/dashboard")
    }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signOutUser() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    redirect("/")
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}