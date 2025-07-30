"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(data: {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
}) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Try to update users table first, create if doesn't exist
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new record
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error("Error creating user profile:", insertError)
        return { success: false, error: "Failed to create profile" }
      }
    } else {
      // User exists, update record
      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        return { success: false, error: "Failed to update profile" }
      }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Server error:", error)
    return { success: false, error: "Server error occurred" }
  }
}