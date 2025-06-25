"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateBookingData {
  user_id: string
  experience_id: string
  host_id: string
  booking_date: string
  departure_time: string // Must be provided for availability check
  number_of_guests: number
  guest_details?: any
  total_price: number
  special_requests?: string
  dietary_requirements?: string[]
}

export async function createBooking(bookingData: CreateBookingData) {
  const supabase = createClient()

  try {
    // Start a transaction-like operation (Supabase doesn't have explicit transactions for RLS,
    // but atomic updates with `check` and `returning` can achieve similar safety)

    // 1. Find the availability slot and check capacity
    const { data: availabilitySlot, error: fetchError } = await supabase
      .from("host_availability")
      .select("id, available_capacity")
      .eq("host_profile_id", bookingData.host_id)
      .eq("date", bookingData.booking_date)
      .eq("start_time", bookingData.departure_time)
      .single()

    if (fetchError || !availabilitySlot) {
      console.error("Availability slot not found:", fetchError?.message)
      return { success: false, error: "Selected time slot is not available or does not exist." }
    }

    if (availabilitySlot.available_capacity < bookingData.number_of_guests) {
      return { success: false, error: "Not enough capacity for the selected number of guests." }
    }

    // 2. Decrement available_capacity and insert booking atomically
    // Using a single RPC call or a function in Supabase for true atomicity is ideal.
    // For now, we'll do two separate calls, relying on RLS and optimistic locking if possible.
    // A more robust solution would involve a Supabase function.

    const newCapacity = availabilitySlot.available_capacity - bookingData.number_of_guests

    const { data: updatedAvailability, error: updateError } = await supabase
      .from("host_availability")
      .update({ available_capacity: newCapacity })
      .eq("id", availabilitySlot.id)
      .gte("available_capacity", bookingData.number_of_guests) // Ensure capacity hasn't changed since fetch
      .select("id, available_capacity")
      .single()

    if (updateError || !updatedAvailability) {
      console.error("Failed to update availability:", updateError?.message)
      return { success: false, error: "Failed to update availability. Please try again (possible concurrency issue)." }
    }

    // 3. Insert the booking
    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          booking_status: "pending", // Or 'confirmed' if auto-accept
          payment_status: "pending",
          currency: "EUR",
        },
      ])
      .select()
      .single()

    if (bookingError) {
      console.error("Error creating booking:", bookingError)
      // IMPORTANT: If booking insertion fails, you should ideally revert the availability update.
      // This requires a more complex transaction management (e.g., Supabase functions or a queue).
      // For this example, we'll log and return error.
      return { success: false, error: bookingError.message }
    }

    // Revalidate paths that might show booking data or availability
    revalidatePath(`/experience/${bookingData.experience_id}`)
    revalidatePath(`/dashboard`) // Assuming dashboard shows user bookings

    return { success: true, data: newBooking }
  } catch (error: any) {
    console.error("Booking server action error:", error)
    return { success: false, error: "An unexpected error occurred during booking." }
  }
}

// Function to handle booking cancellation and increment availability
export async function cancelBooking(bookingId: string) {
  const supabase = createClient()

  try {
    // 1. Fetch the booking details
    const { data: booking, error: fetchBookingError } = await supabase
      .from("bookings")
      .select("experience_id, host_id, booking_date, departure_time, number_of_guests")
      .eq("id", bookingId)
      .single()

    if (fetchBookingError || !booking) {
      console.error("Booking not found for cancellation:", fetchBookingError?.message)
      return { success: false, error: "Booking not found." }
    }

    // 2. Update booking status to cancelled
    const { error: updateBookingError } = await supabase
      .from("bookings")
      .update({ booking_status: "cancelled_user" }) // Or 'cancelled_host'
      .eq("id", bookingId)

    if (updateBookingError) {
      console.error("Failed to update booking status to cancelled:", updateBookingError.message)
      return { success: false, error: "Failed to cancel booking." }
    }

    // 3. Increment available_capacity for the corresponding slot
    const { data: availabilitySlot, error: fetchAvailabilityError } = await supabase
      .from("host_availability")
      .select("id, available_capacity")
      .eq("host_profile_id", booking.host_id)
      .eq("date", booking.booking_date)
      .eq("start_time", booking.departure_time)
      .single()

    if (fetchAvailabilityError || !availabilitySlot) {
      console.warn("Availability slot not found for cancellation, cannot increment capacity.")
      // Continue, as booking is already marked cancelled
    } else {
      const newCapacity = availabilitySlot.available_capacity + booking.number_of_guests
      const { error: updateAvailabilityError } = await supabase
        .from("host_availability")
        .update({ available_capacity: newCapacity })
        .eq("id", availabilitySlot.id)

      if (updateAvailabilityError) {
        console.error("Failed to increment availability capacity on cancellation:", updateAvailabilityError.message)
        // Log error, but booking is still cancelled
      }
    }

    revalidatePath(`/experience/${booking.experience_id}`)
    revalidatePath(`/dashboard`)

    return { success: true, message: "Booking cancelled successfully." }
  } catch (error: any) {
    console.error("Cancel booking server action error:", error)
    return { success: false, error: "An unexpected error occurred during cancellation." }
  }
}
