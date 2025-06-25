import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { experienceSchema } from "@/lib/validation/experience"
import type { Experience } from "@/types/business"

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

async function validateBusinessUser(supabase: any) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }

    if (!user) {
      throw new Error("User not authenticated")
    }

    if (user.user_metadata?.user_type !== "business") {
      throw new Error("Access denied: Business account required")
    }

    return user
  } catch (error) {
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Rate limiting
    const url = new URL(request.url)
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const user = await validateBusinessUser(supabase)

    // Parse query parameters with validation
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "20")))
    const offset = (page - 1) * limit

    const {
      data: experiencesData,
      error: experiencesError,
      count,
    } = await supabase
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
        difficulty_level,
        is_active,
        created_at,
        updated_at
      `,
        { count: "exact" },
      )
      .eq("host_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (experiencesError) {
      console.error("Database error:", experiencesError)
      return NextResponse.json(
        { error: "Failed to fetch experiences", details: experiencesError.message },
        { status: 500 },
      )
    }

    // Transform data safely
    const experiences: Experience[] = (experiencesData || []).map((exp) => ({
      id: exp.id,
      host_id: exp.host_id,
      title: exp.title,
      description: exp.description,
      location: exp.location,
      price: exp.price_per_person,
      duration_hours: exp.duration_hours,
      max_guests: exp.max_guests,
      itinerary: exp.itinerary,
      difficulty_level: exp.difficulty_level,
      is_active: exp.is_active,
      created_at: exp.created_at,
      updated_at: exp.updated_at,
      next_booking_date: null,
      next_booking_time: null,
    }))

    return NextResponse.json({
      experiences,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1,
      },
    })
  } catch (error: any) {
    console.error("Error in GET /api/business/experiences:", error)

    if (error.message.includes("Authentication") || error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(clientIP, 5, 60000)) {
      // Stricter limit for POST
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const user = await validateBusinessUser(supabase)

    // Validate request body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate with Zod schema
    const validationResult = experienceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      )
    }

    const validatedData = validationResult.data

    // Create experience with validated data
    const { data: newExperience, error: createError } = await supabase
      .from("experiences")
      .insert({
        host_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        short_description: validatedData.short_description,
        location: validatedData.location,
        activity_type: validatedData.activity_type,
        category: validatedData.category,
        duration_hours: validatedData.duration_hours,
        max_guests: validatedData.max_guests,
        min_guests: validatedData.min_guests,
        price_per_person: validatedData.price_per_person,
        difficulty_level: validatedData.difficulty_level,
        primary_image_url: validatedData.primary_image_url,
        included_amenities: validatedData.included_amenities || [],
        what_to_bring: validatedData.what_to_bring || [],
        min_age: validatedData.min_age,
        max_age: validatedData.max_age,
        tags: validatedData.tags || [],
        seasonal_availability: validatedData.seasonal_availability || [],
        is_active: validatedData.is_active,
      })
      .select()
      .single()

    if (createError) {
      console.error("Database error creating experience:", createError)

      // Handle specific database errors
      if (createError.code === "23505") {
        return NextResponse.json({ error: "Experience with this title already exists" }, { status: 409 })
      }

      if (createError.message.includes("check constraint")) {
        return NextResponse.json({ error: "Invalid data provided", details: createError.message }, { status: 400 })
      }

      return NextResponse.json({ error: "Failed to create experience", details: createError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: newExperience }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/business/experiences:", error)

    if (error.message.includes("Authentication") || error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
