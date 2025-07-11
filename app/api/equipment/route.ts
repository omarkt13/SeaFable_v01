import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')
    const category = searchParams.get('category')

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('equipment')
      .select('*')
      .eq('business_id', businessId)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: equipment, error } = await query.order('name')

    if (error) {
      console.error('Error fetching equipment:', error)
      return NextResponse.json(
        { error: 'Failed to fetch equipment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ equipment })
  } catch (error) {
    console.error('Error in GET /api/equipment:', error)
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
    if (!body.business_id || !body.name || !body.category) {
      return NextResponse.json(
        { error: 'Business ID, name, and category are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['safety', 'activity', 'comfort', 'navigation']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate condition
    const validConditions = ['excellent', 'good', 'fair', 'needs_replacement']
    if (body.condition && !validConditions.includes(body.condition)) {
      return NextResponse.json(
        { error: 'Invalid condition' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedData = {
      business_id: body.business_id,
      name: sanitizeInput(body.name),
      category: body.category,
      description: sanitizeInput(body.description || ''),
      quantity: parseInt(body.quantity) || 1,
      condition: body.condition || 'good',
      last_maintenance: body.last_maintenance || null,
    }

    const { data: equipment, error } = await supabase
      .from('equipment')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('Error creating equipment:', error)
      return NextResponse.json(
        { error: 'Failed to create equipment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ equipment }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/equipment:', error)
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
        { error: 'Equipment ID is required' },
        { status: 400 }
      )
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = ['safety', 'activity', 'comfort', 'navigation']
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // Validate condition if provided
    if (body.condition) {
      const validConditions = ['excellent', 'good', 'fair', 'needs_replacement']
      if (!validConditions.includes(body.condition)) {
        return NextResponse.json(
          { error: 'Invalid condition' },
          { status: 400 }
        )
      }
    }

    // Sanitize input
    const updateData: any = {}
    if (body.name) updateData.name = sanitizeInput(body.name)
    if (body.description) updateData.description = sanitizeInput(body.description)
    if (body.category) updateData.category = body.category
    if (body.quantity) updateData.quantity = parseInt(body.quantity)
    if (body.condition) updateData.condition = body.condition
    if (body.last_maintenance) updateData.last_maintenance = body.last_maintenance

    const { data: equipment, error } = await supabase
      .from('equipment')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating equipment:', error)
      return NextResponse.json(
        { error: 'Failed to update equipment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ equipment })
  } catch (error) {
    console.error('Error in PUT /api/equipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Equipment ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting equipment:', error)
      return NextResponse.json(
        { error: 'Failed to delete equipment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/equipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 