// Database diagnostics and health check utilities
import { createClient } from './supabase/client'

export async function runDatabaseDiagnostics() {
  const supabase = createClient()
  const diagnostics = {
    timestamp: new Date().toISOString(),
    results: [] as Array<{ test: string; status: 'pass' | 'fail'; message: string; details?: any }>
  }

  // Test 1: Authentication
  try {
    // Check if environment variables are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      diagnostics.results.push({
        test: 'Authentication',
        status: 'fail',
        message: "Supabase environment variables not configured",
        details: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
      return diagnostics
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      diagnostics.results.push({
        test: 'Authentication',
        status: 'fail',
        message: `Auth error: ${authError.message}`,
        details: authError
      })
    } else if (user) {
      diagnostics.results.push({
        test: 'Authentication',
        status: 'pass',
        message: `User authenticated: ${user.email}`,
        details: { userId: user.id, userType: user.user_metadata?.user_type }
      })
    } else {
      diagnostics.results.push({
        test: 'Authentication',
        status: 'fail',
        message: 'No authenticated user'
      })
    }
  } catch (error) {
    diagnostics.results.push({
      test: 'Authentication',
      status: 'fail',
      message: `Auth check failed: ${error instanceof Error ? error.message : error}`
    })
  }

  // Test 2: Check business_profiles table
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      diagnostics.results.push({
        test: 'Business Profiles Table',
        status: 'fail',
        message: `Table access error: ${error.message}`,
        details: error
      })
    } else {
      diagnostics.results.push({
        test: 'Business Profiles Table',
        status: 'pass',
        message: 'Table accessible'
      })
    }
  } catch (error) {
    diagnostics.results.push({
      test: 'Business Profiles Table',
      status: 'fail',
      message: `Table check failed: ${error instanceof Error ? error.message : error}`
    })
  }

  // Test 3: Check customer_profiles table
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      diagnostics.results.push({
        test: 'Customer Profiles Table',
        status: 'fail',
        message: `Table access error: ${error.message}`,
        details: error
      })
    } else {
      diagnostics.results.push({
        test: 'Customer Profiles Table',
        status: 'pass',
        message: 'Table accessible'
      })
    }
  } catch (error) {
    diagnostics.results.push({
      test: 'Customer Profiles Table',
      status: 'fail',
      message: `Table check failed: ${error instanceof Error ? error.message : error}`
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