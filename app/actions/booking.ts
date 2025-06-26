"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

interface BookingData {
  experience_id: string
  user_id: string
  booking_date: string
  departure_time: string
  number_of_guests: number
  total_price: number
  booking_status: "pending" | "confirmed" | "cancelled_user" | "cancelled_host" | "completed"
  payment_status: "pending" | "paid" | "refunded" | "failed" | "completed"
  special_requests?: string
  host_id: string // Added host_id to booking data
}

export async function createBooking(bookingData: BookingData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.from("bookings").insert([bookingData]).select().single()

  if (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: error.message }
  }

  // Revalidate paths that might be affected by a new booking
  revalidatePath("/dashboard")
  revalidatePath("/business/home")
  revalidatePath(`/experience/${bookingData.experience_id}`)

  return { success: true, data }
}

export async function updateBookingStatus(bookingId: string, status: BookingData["booking_status"]) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("bookings")
    .update({ booking_status: status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select()
    .single()

  if (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/business/home")
  // Potentially revalidate specific experience page if status affects availability display
  // revalidatePath(`/experience/${data.experience_id}`);

  return { success: true, data }
}
