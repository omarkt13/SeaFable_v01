
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const tests = []
    
    // Test 1: Basic connection
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      tests.push({
        name: 'Database Connection',
        status: error ? 'FAILED' : 'PASSED',
        error: error?.message,
        detail: 'Basic database connectivity test'
      })
    } catch (error) {
      tests.push({
        name: 'Database Connection',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        detail: 'Failed to connect to database'
      })
    }
    
    // Test 2: Schema validation - check if key tables exist
    const tablesToCheck = [
      'users',
      'host_profiles', 
      'experiences',
      'bookings',
      'reviews',
      'host_business_settings',
      'host_availability'
    ]
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        tests.push({
          name: `Table: ${table}`,
          status: error ? 'FAILED' : 'PASSED',
          error: error?.message,
          detail: `Table ${table} accessibility test`
        })
      } catch (error) {
        tests.push({
          name: `Table: ${table}`,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          detail: `Failed to access table ${table}`
        })
      }
    }
    
    // Test 3: Authentication
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      tests.push({
        name: 'Authentication',
        status: authError ? 'WARNING' : 'PASSED',
        error: authError?.message,
        detail: user ? `Authenticated as ${user.email}` : 'No current user session',
        userId: user?.id
      })
    } catch (error) {
      tests.push({
        name: 'Authentication',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        detail: 'Failed to check authentication status'
      })
    }
    
    const summary = {
      total: tests.length,
      passed: tests.filter(t => t.status === 'PASSED').length,
      failed: tests.filter(t => t.status === 'FAILED').length,
      warnings: tests.filter(t => t.status === 'WARNING').length
    }
    
    return NextResponse.json({
      success: summary.failed === 0,
      timestamp: new Date().toISOString(),
      summary,
      tests,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
