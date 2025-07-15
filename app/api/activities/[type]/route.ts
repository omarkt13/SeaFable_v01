import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateExperienceData, sanitizeExperienceData } from '@/lib/security'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const supabase = createClient()
    const { type } = await params

    // Validate activity type
    const validTypes = [
      'sailing', 'surfing', 'kayaking', 'diving', 'jet-skiing',
      'fishing', 'whale-watching', 'paddleboarding', 'windsurfing', 'snorkeling'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      )
    }

    // Get experiences by activity type
    const { data: experiences, error } = await supabase
      .from('experiences')
      .select(`
        *,
        host_profiles (
          id,
          name,
          role,
          specializations,
          years_experience,
          languages
        )
      `)
      .eq('activity_type', type)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching experiences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch experiences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ experiences })
  } catch (error) {
    console.error('Error in GET /api/activities/[type]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const supabase = createClient()
    const { type } = await params
    const body = await request.json()

    // Validate activity type
    const validTypes = [
      'sailing', 'surfing', 'kayaking', 'diving', 'jet-skiing',
      'fishing', 'whale-watching', 'paddleboarding', 'windsurfing', 'snorkeling'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      )
    }

    // Validate and sanitize input data
    const validation = validateExperienceData(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.errors },
        { status: 400 }
      )
    }

    const sanitizedData = sanitizeExperienceData(body)

    // Add activity-specific validation based on type
    const activityValidation = validateActivitySpecificData(type, body)
    if (!activityValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid activity-specific data', details: activityValidation.errors },
        { status: 400 }
      )
    }

    // Create experience with activity type
    const { data: experience, error } = await supabase
      .from('experiences')
      .insert({
        ...sanitizedData,
        activity_type: type,
        activity_specific_details: body.activitySpecificDetails || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating experience:', error)
      return NextResponse.json(
        { error: 'Failed to create experience' },
        { status: 500 }
      )
    }

    return NextResponse.json({ experience }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/activities/[type]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function validateActivitySpecificData(type: string, data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  switch (type) {
    case 'sailing':
      if (!data.activitySpecificDetails?.boatType) {
        errors.push('Boat type is required for sailing experiences')
      }
      if (!data.activitySpecificDetails?.boatLength) {
        errors.push('Boat length is required for sailing experiences')
      }
      break

    case 'diving':
      if (!data.activitySpecificDetails?.diveType) {
        errors.push('Dive type is required for diving experiences')
      }
      if (!data.activitySpecificDetails?.maxDepth) {
        errors.push('Maximum depth is required for diving experiences')
      }
      break

    case 'surfing':
      if (!data.activitySpecificDetails?.surfType) {
        errors.push('Surf type is required for surfing experiences')
      }
      if (!data.activitySpecificDetails?.waveHeight) {
        errors.push('Wave height is required for surfing experiences')
      }
      break

    case 'fishing':
      if (!data.activitySpecificDetails?.fishingType) {
        errors.push('Fishing type is required for fishing experiences')
      }
      if (!data.activitySpecificDetails?.targetSpecies?.length) {
        errors.push('Target species is required for fishing experiences')
      }
      break

    case 'whale-watching':
      if (!data.activitySpecificDetails?.whaleSpecies?.length) {
        errors.push('Whale species is required for whale watching experiences')
      }
      if (!data.activitySpecificDetails?.season) {
        errors.push('Season is required for whale watching experiences')
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
