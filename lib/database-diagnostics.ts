// Database diagnostics and health check utilities
import { createClient } from './supabase/client'

export async function runDatabaseDiagnostics() {
  const supabase = createClient()
  const diagnostics = {
    timestamp: new Date().toISOString(),
    results: [] as Array<{ test: string; status: 'pass' | 'fail'; message: string; details?: any }>
  }

  // Test 1: Authentication (non-blocking for landing page)
  try {
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError) {
      diagnostics.results.push({
        test: 'Authentication',
        status: 'fail',
        message: `Auth error: ${authError.message}`,
        details: authError
      })
    } else if (session?.user) {
      diagnostics.results.push({
        test: 'Authentication',
        status: 'pass',
        message: `User authenticated: ${session.user.email}`,
        details: { userId: session.user.id, userType: session.user.user_metadata?.user_type }
      })
    } else {
      diagnostics.results.push({
        test: 'Authentication',
        status: 'pass',
        message: 'No active session (normal for landing page)',
        details: 'Landing page access - authentication not required'
      })
    }
  } catch (error) {
    diagnostics.results.push({
      test: 'Authentication',
      status: 'fail',
      message: `Auth check failed: ${error instanceof Error ? error.message : error}`
    })
  }

  // Only test database tables if user is authenticated
  // This avoids RLS policy errors on public pages like landing
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    // Test 2: Check host_profiles table (correct table name from schema)
    try {
      const { data, error } = await supabase
        .from('host_profiles')
        .select('count(*)', { count: 'exact', head: true })

      if (error) {
        diagnostics.results.push({
          test: 'Host Profiles Table',
          status: 'fail',
          message: `Table access error: ${error.message || 'Connection or RLS policy issue'}`,
          details: { 
            ...error, 
            hint: 'Check Supabase environment variables and RLS policies'
          }
        })
      } else {
        diagnostics.results.push({
          test: 'Host Profiles Table',
          status: 'pass',
          message: 'Table accessible'
        })
      }
    } catch (error) {
      diagnostics.results.push({
        test: 'Host Profiles Table',
        status: 'fail',
        message: `Table check failed: ${error instanceof Error ? error.message : error}`
      })
    }

    // Test 3: Check users table (correct table name from schema)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true })

      if (error) {
        diagnostics.results.push({
          test: 'Users Table',
          status: 'fail',
          message: `Table access error: ${error.message || 'Connection or RLS policy issue'}`,
          details: { 
            ...error, 
            hint: 'Check Supabase environment variables and RLS policies'
          }
        })
      } else {
        diagnostics.results.push({
          test: 'Users Table',
          status: 'pass',
          message: 'Table accessible'
        })
      }
    } catch (error) {
      diagnostics.results.push({
        test: 'Users Table',
        status: 'fail',
        message: `Table check failed: ${error instanceof Error ? error.message : error}`
      })
    }

    // Test 4: Check experiences table (core table for the marketplace)
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('count(*)', { count: 'exact', head: true })

      if (error) {
        diagnostics.results.push({
          test: 'Experiences Table',
          status: 'fail',
          message: `Table access error: ${error.message || 'Connection or RLS policy issue'}`,
          details: { 
            ...error, 
            hint: 'Check Supabase environment variables and RLS policies'
          }
        })
      } else {
        diagnostics.results.push({
          test: 'Experiences Table',
          status: 'pass',
          message: 'Table accessible'
        })
      }
    } catch (error) {
      diagnostics.results.push({
        test: 'Experiences Table',
        status: 'fail',
        message: `Table check failed: ${error instanceof Error ? error.message : error}`
      })
    }
  } else {
    diagnostics.results.push({
      test: 'Database Tables',
      status: 'pass',
      message: 'Skipped table tests for unauthenticated user (normal for public pages)'
    })
  }

  return diagnostics
}

export function logDatabaseDiagnostics() {
  runDatabaseDiagnostics().then(diagnostics => {
    console.log('🔍 Database Diagnostics Report:')
    console.log('Timestamp:', diagnostics.timestamp)
    diagnostics.results.forEach(result => {
      const emoji = result.status === 'pass' ? '✅' : '❌'
      console.log(`${emoji} ${result.test}: ${result.message}`)
      if (result.details && result.status === 'fail') {
        console.log('   Details:', result.details)
      }
    })
  }).catch(error => {
    console.error('Failed to run database diagnostics:', error)
  })
}