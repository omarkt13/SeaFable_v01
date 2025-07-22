"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(prevState: any, formData: FormData) {
  const supabase = await createClient()

  try {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, message: "User not authenticated" }
    }

    // Update customer profile
    const { error } = await supabase
      .from("customer_profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        // Note: phone_number field may need to be added to the customer_profiles table
      })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, message: "Failed to update profile" }
    }

    revalidatePath("/dashboard")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Server error:", error)
    return { success: false, message: "Server error occurred" }
  }
}