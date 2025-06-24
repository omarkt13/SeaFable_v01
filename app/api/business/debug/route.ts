import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  console.log("Debug API: Starting")

  try {
    const supabase = createClient()

    const debugInfo = {
      timestamp: new Date().toISOString(),
      tests: {
        supabaseConnection: false,
        authentication: false,
        hostProfile: false,
        experiences: false,
        bookings: false,
      },
      details: {} as any,
    }

    // Test 1: Supabase connection
    try {
      const { data, error } = await supabase.from("users").select("id").limit(1)
      debugInfo.tests.supabaseConnection = !error
      debugInfo.details.supabaseConnection = error?.message || "OK"
    } catch (error) {
      debugInfo.details.supabaseConnection = error instanceof Error ? error.message : "Connection failed"
    }

    // Test 2: Authentication
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      debugInfo.tests.authentication = !authError && !!user
      debugInfo.details.authentication = {
        error: authError?.message,
        userId: user?.id,
        userType: user?.user_metadata?.user_type,
      }
    } catch (error) {
      debugInfo.details.authentication = error instanceof Error ? error.message : "Auth failed"
    }

    // Test 3: Host profile (only if authenticated)
    if (debugInfo.tests.authentication) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const { data: hostProfile, error: hostError } = await supabase
          .from("host_profiles")
          .select("id, name")
          .eq("user_id", user!.id)
          .single()

        debugInfo.tests.hostProfile = !hostError && !!hostProfile
        debugInfo.details.hostProfile = {
          error: hostError?.message,
          profileId: hostProfile?.id,
          name: hostProfile?.name,
        }

        // Test 4: Experiences (only if host profile exists)
        if (hostProfile) {
          try {
            const { data: experiences, error: expError } = await supabase
              .from("experiences")
              .select("id")
              .eq("host_id", hostProfile.id)
              .limit(1)

            debugInfo.tests.experiences = !expError
            debugInfo.details.experiences = expError?.message || "OK"
          } catch (error) {
            debugInfo.details.experiences = error instanceof Error ? error.message : "Experiences failed"
          }

          // Test 5: Bookings (only if host profile exists)
          try {
            const { data: bookings, error: bookingsError } = await supabase
              .from("bookings")
              .select("id")
              .eq("host_id", hostProfile.id)
              .limit(1)

            debugInfo.tests.bookings = !bookingsError
            debugInfo.details.bookings = bookingsError?.message || "OK"
          } catch (error) {
            debugInfo.details.bookings = error instanceof Error ? error.message : "Bookings failed"
          }
        }
      } catch (error) {
        debugInfo.details.hostProfile = error instanceof Error ? error.message : "Host profile failed"
      }
    }

    console.log("Debug API: Completed", debugInfo)
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("Debug API: Error:", error)
    return NextResponse.json({
      error: "Debug API error",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
