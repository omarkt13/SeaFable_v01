import { NextResponse } from "next/server"
import { setHostAvailability } from "@/lib/supabase-business"
import { getSession } from "@/lib/auth-utils" // Assuming this function exists to get server-side session
import type { HostAvailability } from "@/types/business"

export async function POST(request: Request) {
  const session = await getSession()

  if (!session || session.user.user_metadata.role !== "host") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const availabilityData: HostAvailability[] = await request.json()
    const host_profile_id = session.user.id // Use the authenticated user's ID as host_profile_id

    // Ensure each availability item has the correct host_profile_id
    const formattedAvailability = availabilityData.map((item) => ({
      ...item,
      host_profile_id: host_profile_id,
    }))

    const result = await setHostAvailability(host_profile_id, formattedAvailability)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error: any) {
    console.error("Error setting host availability:", error.message)
    return NextResponse.json({ error: "Failed to set availability", details: error.message }, { status: 500 })
  }
}
