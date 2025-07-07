"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(
  userId: string,
  updates: { firstName?: string; lastName?: string; email?: string; phone?: string },
) {
  const supabase = createClient()

  // Update auth.users table (for email, if changed)
  if (updates.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email: updates.email,
    })
    if (authError) {
      console.error("Error updating auth user email:", authError)
      return { success: false, message: authError.message }
    }
  }

  // Update public.users table
  const { data, error } = await supabase
    .from("users")
    .update({
      first_name: updates.firstName,
      last_name: updates.lastName,
      email: updates.email, // Update email in profile table as well
      phone: updates.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user profile:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard") // Revalidate the dashboard page to show updated info
  return { success: true, message: "Profile updated successfully!", data }
}
