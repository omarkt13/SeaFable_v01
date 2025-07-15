import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const hostId = searchParams.get('host_id')

    let query = supabase.from('certifications').select('*')

    if (category) {
      query = query.eq('category', category)
    }

    if (hostId) {
      // Get certifications for a specific host
      const { data: hostCertifications, error: hostError } = await supabase
        .from('host_certifications')
        .select(`
          *,
          certifications (*)
        `)
        .eq('host_id', hostId)

      if (hostError) {
        console.error('Error fetching host certifications:', hostError)
        return NextResponse.json(
          { error: 'Failed to fetch host certifications' },
          { status: 500 }
        )
      }

      return NextResponse.json({ hostCertifications })
    }

    const { data: certifications, error } = await query.order('name')

    if (error) {
      console.error('Error fetching certifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch certifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ certifications })
  } catch (error) {
    console.error('Error in GET /api/certifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.issuing_authority || !body.category) {
      return NextResponse.json(
        { error: 'Name, issuing authority, and category are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['safety', 'instruction', 'navigation', 'specialized']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedData = {
      name: sanitizeInput(body.name),
      issuing_authority: sanitizeInput(body.issuing_authority),
      description: sanitizeInput(body.description || ''),
      validity_period: body.validity_period ? parseInt(body.validity_period) : null,
      category: body.category,
    }

    const { data: certification, error } = await supabase
      .from('certifications')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('Error creating certification:', error)
      return NextResponse.json(
        { error: 'Failed to create certification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ certification }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/certifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'Certification ID is required' },
        { status: 400 }
      )
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = ['safety', 'instruction', 'navigation', 'specialized']
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // Sanitize input
    const updateData: any = {}
    if (body.name) updateData.name = sanitizeInput(body.name)
    if (body.issuing_authority) updateData.issuing_authority = sanitizeInput(body.issuing_authority)
    if (body.description) updateData.description = sanitizeInput(body.description)
    if (body.category) updateData.category = body.category
    if (body.validity_period) updateData.validity_period = parseInt(body.validity_period)

    const { data: certification, error } = await supabase
      .from('certifications')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating certification:', error)
      return NextResponse.json(
        { error: 'Failed to update certification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ certification })
  } catch (error) {
    console.error('Error in PUT /api/certifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add certification to host
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    if (!body.host_id || !body.certification_id || !body.issued_date) {
      return NextResponse.json(
        { error: 'Host ID, certification ID, and issued date are required' },
        { status: 400 }
      )
    }

    const { data: hostCertification, error } = await supabase
      .from('host_certifications')
      .insert({
        host_id: body.host_id,
        certification_id: body.certification_id,
        issued_date: body.issued_date,
        expiry_date: body.expiry_date || null,
        certification_number: body.certification_number || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding certification to host:', error)
      return NextResponse.json(
        { error: 'Failed to add certification to host' },
        { status: 500 }
      )
    }

    return NextResponse.json({ hostCertification })
  } catch (error) {
    console.error('Error in PATCH /api/certifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
