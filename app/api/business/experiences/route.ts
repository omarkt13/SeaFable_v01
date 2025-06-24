import { NextResponse } from "next/server"
import { createExperience, updateExperience } from "@/lib/supabase-business"
import { getSession } from "@/lib/auth-utils" // Assuming this function exists to get server-side session

export async function POST(request: Request) {
  const session = await getSession()

  if (!session || session.user.user_metadata.role !== "host") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const host_id = session.user.id // Use the authenticated user's ID as host_id

    const newExperience = await createExperience({ ...body, host_id })
    return NextResponse.json({ success: true, data: newExperience }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating experience:", error.message)
    return NextResponse.json({ error: "Failed to create experience", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getSession()

  if (!session || session.user.user_metadata.role !== "host") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, ...updates } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Experience ID is required for update" }, { status: 400 })
    }

    // Optional: Verify that the host owns this experience before updating
    // const { data: existingExperience, error: fetchError } = await supabase.from('experiences').select('host_id').eq('id', id).single();
    // if (fetchError || existingExperience?.host_id !== session.user.id) {
    //   return NextResponse.json({ error: "Forbidden: You do not own this experience" }, { status: 403 });
    // }

    const updatedExperience = await updateExperience(id, updates)
    return NextResponse.json({ success: true, data: updatedExperience }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating experience:", error.message)
    return NextResponse.json({ error: "Failed to update experience", details: error.message }, { status: 500 })
  }
}
