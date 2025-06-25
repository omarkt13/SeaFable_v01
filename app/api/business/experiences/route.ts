import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Experience } from "@/types/business"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Check if user exists and if their user_type metadata is 'business'
  if (userError || !user || user.user_metadata.user_type !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: experiencesData, error: experiencesError } = await supabase
      .from("experiences")
      .select(
        `
        id,
        host_id,
        title,
        description,
        location,
        price_per_person,
        duration_hours,
        max_guests,
        itinerary,
        created_at,
        updated_at
        `,
      )
      .eq("host_id", user.id)
      .order("created_at", { ascending: false })

    if (experiencesError) {
      throw experiencesError
    }

    if (!experiencesData) {
      return NextResponse.json({ experiences: [] }, { status: 200 })
    }

    const experiencesWithNextBooking: Experience[] = await Promise.all(
      experiencesData.map(async (experience) => {
        const { data: nextBooking, error: bookingError } = await supabase
          .from("bookings")
          .select("booking_date, start_time")
          .eq("experience_id", experience.id)
          .gte("booking_date", new Date().toISOString().split("T")[0])
          .order("booking_date", { ascending: true })
          .order("start_time", { ascending: true })
          .limit(1)
          .maybeSingle()

        if (bookingError && bookingError.code !== "PGRST116") {
          console.error(`Error fetching next booking for experience ${experience.id}:`, bookingError)
        }

        return {
          id: experience.id,
          host_id: experience.host_id,
          title: experience.title,
          description: experience.description,
          location: experience.location,
          price: experience.price_per_person,
          duration_hours: experience.duration_hours,
          max_guests: experience.max_guests,
          itinerary: experience.itinerary,
          created_at: experience.created_at,
          updated_at: experience.updated_at,
          next_booking_date: nextBooking?.booking_date || null,
          next_booking_time: nextBooking?.start_time || null,
        } as Experience
      }),
    )

    return NextResponse.json({ experiences: experiencesWithNextBooking }, { status: 200 })
  } catch (error: any) {
    console.error("Error in GET /api/business/experiences:", error.message)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Check if user exists and if their user_type metadata is 'business'
  if (userError || !user || user.user_metadata.user_type !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const host_id = user.id // Use the authenticated user's ID as host_id

    // Assuming createExperience is a function that inserts into the 'experiences' table
    // and handles the mapping from the body to the database schema (e.g., price -> price_per_person)
    const { data: newExperience, error: createError } = await supabase
      .from("experiences")
      .insert({
        host_id: host_id,
        title: body.title,
        description: body.description,
        location: body.location,
        price_per_person: body.price, // Map 'price' from frontend to 'price_per_person' in DB
        duration_hours: body.duration_hours,
        max_guests: body.max_guests,
        itinerary: body.itinerary,
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating experience:", createError.message)
      return NextResponse.json({ error: "Failed to create experience", details: createError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: newExperience }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating experience:", error.message)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Check if user exists and if their user_type metadata is 'business'
  if (userError || !user || user.user_metadata.user_type !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, ...updates } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Experience ID is required for update" }, { status: 400 })
    }

    // Verify that the host owns this experience before updating
    const { data: existingExperience, error: fetchError } = await supabase
      .from("experiences")
      .select("host_id")
      .eq("id", id)
      .single()

    if (fetchError || existingExperience?.host_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this experience" }, { status: 403 })
    }

    // Map 'price' from frontend to 'price_per_person' in DB if present in updates
    const dbUpdates: Record<string, any> = { ...updates }
    if (dbUpdates.price !== undefined) {
      dbUpdates.price_per_person = dbUpdates.price
      delete dbUpdates.price
    }

    const { data: updatedExperience, error: updateError } = await supabase
      .from("experiences")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating experience:", updateError.message)
      return NextResponse.json({ error: "Failed to update experience", details: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updatedExperience }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating experience:", error.message)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
