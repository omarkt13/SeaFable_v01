import { supabase } from "./supabase"

// Authentication functions
export interface Experience {
  id: string
  host_id: string
  title: string
  description: string
  short_description?: string
  location: string
  specific_location?: string
  country?: string
  activity_type: string
  category: string[]
  duration_hours: number
  duration_display?: string
  max_guests: number
  min_guests: number
  price_per_person: number
  difficulty_level: string
  rating: number
  total_reviews: number
  total_bookings: number
  primary_image_url?: string
  weather_contingency?: string
  included_amenities: string[]
  what_to_bring: string[]
  min_age?: number
  max_age?: number
  age_restriction_details?: string
  activity_specific_details?: any
  tags: string[]
  seasonal_availability: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  host_profiles?: HostProfile
  experience_images?: ExperienceImage[]
  reviews?: Review[]
}

export interface HostProfile {
  id: string
  user_id?: string
  name: string
  bio?: string
  avatar_url?: string
  years_experience: number
  certifications: string[]
  specialties: string[]
  rating: number
  total_reviews: number
  host_type: string
  languages_spoken: string[]
  business_name?: string
  contact_name?: string
  email?: string
  phone?: string
  business_type?: string
  location?: string
  description?: string
  business_registration_id?: string
  insurance_details?: string
  created_at: string
  updated_at: string
}

export interface ExperienceImage {
  id: string
  experience_id: string
  image_url: string
  alt_text?: string
  display_order: number
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  user_id: string
  experience_id: string
  host_id: string
  rating: number
  title?: string
  comment?: string
  pros?: string[]
  cons?: string[]
  would_recommend?: boolean
  verified_booking: boolean
  helpful_votes: number
  response_from_host_comment?: string
  response_from_host_at?: string
  created_at: string
  updated_at: string
  users?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export interface Booking {
  id: string
  user_id: string
  experience_id: string
  host_id: string
  booking_date: string
  departure_time?: string
  number_of_guests: number
  guest_details?: any
  total_price: number
  booking_status: string
  special_requests?: string
  dietary_requirements: string[]
  payment_id?: string
  payment_method?: string
  payment_status: string
  amount_paid?: number
  currency: string
  booked_at: string
  updated_at: string
}

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Get user data from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        return { success: false, error: "User data not found" }
      }

      // Get host profile if user is a host
      let hostProfile = null
      let businessProfile = null

      if (userData.role === "host") {
        const { data: hostData, error: hostError } = await supabase
          .from("host_profiles")
          .select("*")
          .eq("user_id", userData.id)
          .single()

        if (!hostError && hostData) {
          hostProfile = {
            id: hostData.id,
            name: hostData.name,
            bio: hostData.bio || "",
            years_experience: hostData.years_experience || 0,
            certifications: hostData.certifications || [],
            specialties: hostData.specialties || [],
            rating: hostData.rating || 0,
            total_reviews: hostData.total_reviews || 0,
            host_type: hostData.host_type || "individual_operator",
          }

          businessProfile = {
            companyName: hostData.business_name || hostData.name,
            businessType: hostData.business_type || "Tour Operator",
            yearsInBusiness: hostData.years_experience || 0,
            totalExperiences: 0,
            averageRating: hostData.rating || 0,
          }
        }
      }

      return {
        success: true,
        user: {
          ...userData,
          hostProfile,
          businessProfile,
        },
      }
    }

    return { success: false, error: "Authentication failed" }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Network error occurred" }
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: "Network error occurred" }
  }
}

// Experience functions
export async function getExperiences(filters = {}) {
  try {
    let query = supabase
      .from("experiences")
      .select(`
        *,
        host_profiles!experiences_host_id_fkey (
          id,
          name,
          avatar_url,
          rating,
          total_reviews,
          host_type
        ),
        experience_images (
          image_url,
          alt_text,
          display_order
        )
      `)
      .eq("is_active", true)

    // Apply filters
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`)
    }
    if (filters.activity_type) {
      query = query.eq("activity_type", filters.activity_type)
    }
    if (filters.min_price) {
      query = query.gte("price_per_person", filters.min_price)
    }
    if (filters.max_price) {
      query = query.lte("price_per_person", filters.max_price)
    }
    if (filters.difficulty) {
      query = query.eq("difficulty_level", filters.difficulty)
    }
    if (filters.min_rating) {
      query = query.gte("rating", filters.min_rating)
    }

    // Apply sorting
    if (filters.sort_by) {
      switch (filters.sort_by) {
        case "price_low":
          query = query.order("price_per_person", { ascending: true })
          break
        case "price_high":
          query = query.order("price_per_person", { ascending: false })
          break
        case "rating":
          query = query.order("rating", { ascending: false })
          break
        case "popular":
          query = query.order("total_bookings", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }
    } else {
      query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching experiences:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching experiences:", error)
    return { success: false, error: "Network error occurred", data: [] }
  }
}

export async function getExperienceById(id: string) {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select(`
        *,
        host_profiles!experiences_host_id_fkey (
          id,
          name,
          bio,
          avatar_url,
          rating,
          total_reviews,
          host_type,
          years_experience,
          certifications,
          specialties
        ),
        experience_images (
          image_url,
          alt_text,
          display_order
        ),
        reviews (
          id,
          rating,
          title,
          comment,
          created_at,
          users (
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching experience:", error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching experience:", error)
    return { success: false, error: "Network error occurred", data: null }
  }
}

// Get reviews for a specific experience
export async function getExperienceReviews(experienceId: string) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        users!reviews_user_id_fkey (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("experience_id", experienceId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return { success: false, error: "Network error occurred", data: [] }
  }
}

// Get user bookings
export async function getUserBookings(userId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences!bookings_experience_id_fkey (
          id,
          title,
          location,
          primary_image_url,
          duration_display,
          activity_type
        ),
        host_profiles!bookings_host_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .order("booking_date", { ascending: false })

    if (error) {
      console.error("Error fetching user bookings:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return { success: false, error: "Network error occurred", data: [] }
  }
}

// Get host bookings
export async function getHostBookings(hostId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences!bookings_experience_id_fkey (
          id,
          title,
          location,
          primary_image_url,
          duration_display
        ),
        users!bookings_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq("host_id", hostId)
      .order("booking_date", { ascending: false })

    if (error) {
      console.error("Error fetching host bookings:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching host bookings:", error)
    return { success: false, error: "Network error occurred", data: [] }
  }
}

// Get host dashboard data
export async function getHostDashboardData(hostId: string) {
  try {
    // Get host profile
    const { data: hostProfile, error: hostError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("id", hostId)
      .single()

    if (hostError) {
      console.error("Error fetching host profile:", hostError)
      return { success: false, error: hostError.message, data: null }
    }

    // Get experiences
    const { data: experiences, error: expError } = await supabase
      .from("experiences")
      .select("*")
      .eq("host_id", hostId)
      .eq("is_active", true)

    if (expError) {
      console.error("Error fetching experiences:", expError)
    }

    // Get recent bookings
    const { data: bookings, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences!bookings_experience_id_fkey (title),
        users!bookings_user_id_fkey (first_name, last_name, avatar_url)
      `)
      .eq("host_id", hostId)
      .order("booked_at", { ascending: false })
      .limit(10)

    if (bookingError) {
      console.error("Error fetching bookings:", bookingError)
    }

    // Get earnings data
    const { data: earnings, error: earningsError } = await supabase
      .from("host_earnings")
      .select("*")
      .eq("host_profile_id", hostId)
      .order("created_at", { ascending: false })

    if (earningsError) {
      console.error("Error fetching earnings:", earningsError)
    }

    return {
      success: true,
      data: {
        hostProfile,
        experiences: experiences || [],
        bookings: bookings || [],
        earnings: earnings || [],
      },
    }
  } catch (error) {
    console.error("Error fetching host dashboard data:", error)
    return { success: false, error: "Network error occurred", data: null }
  }
}

// Get user dashboard data
export async function getUserDashboardData(userId: string) {
  try {
    // Get user profile
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return { success: false, error: userError.message, data: null }
    }

    // Get user bookings
    const bookingsResult = await getUserBookings(userId)

    // Get user reviews
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select(`
        *,
        experiences!reviews_experience_id_fkey (title, primary_image_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (reviewError) {
      console.error("Error fetching reviews:", reviewError)
    }

    return {
      success: true,
      data: {
        user,
        bookings: bookingsResult.data || [],
        reviews: reviews || [],
      },
    }
  } catch (error) {
    console.error("Error fetching user dashboard data:", error)
    return { success: false, error: "Network error occurred", data: null }
  }
}

// Booking functions
export async function createBooking(bookingData: {
  user_id: string
  experience_id: string
  host_id: string
  booking_date: string
  departure_time?: string
  number_of_guests: number
  guest_details?: any
  total_price: number
  special_requests?: string
  dietary_requirements?: string[]
}) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          booking_status: "pending",
          payment_status: "pending",
          currency: "EUR",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating booking:", error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: "Network error occurred", data: null }
  }
}

// Database connection test functions
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Database connection successful" }
  } catch (error) {
    return { success: false, error: "Network error occurred" }
  }
}

export async function testTableAccess() {
  const tables = [
    "users",
    "host_profiles",
    "experiences",
    "bookings",
    "reviews",
    "host_business_settings",
    "host_availability",
    "experience_images",
  ]

  const results = {}

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1)

      if (error) {
        results[table] = { success: false, error: error.message }
      } else {
        results[table] = { success: true, count: data?.length || 0 }
      }
    } catch (error) {
      results[table] = { success: false, error: "Network error" }
    }
  }

  return results
}

export async function getSampleData() {
  try {
    const [usersResult, experiencesResult, bookingsResult] = await Promise.all([
      supabase.from("users").select("*").limit(3),
      supabase.from("experiences").select("*, host_profiles(name)").limit(3),
      supabase.from("bookings").select("*, experiences(title), users(first_name, last_name)").limit(3),
    ])

    return {
      users: usersResult.data || [],
      experiences: experiencesResult.data || [],
      bookings: bookingsResult.data || [],
    }
  } catch (error) {
    console.error("Error fetching sample data:", error)
    return {
      users: [],
      experiences: [],
      bookings: [],
    }
  }
}
