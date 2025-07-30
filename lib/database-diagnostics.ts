// Database diagnostics and health check utilities
import { createClient } from './supabase/client'

export async function runDatabaseDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    results: [] as Array<{ test: string; status: 'pass' | 'fail'; message: string; details?: any }>
  }

  // Check if environment variables are configured first
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    diagnostics.results.push({
      test: 'Environment Configuration',
      status: 'fail',
      message: "Supabase environment variables not configured. Please check your .env.local file.",
      details: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        envFile: 'Make sure .env.local contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      }
    })
    return diagnostics
  }

  const supabase = createClient()

  // Test 1: Basic Connection
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1)
    
    if (error) {
      diagnostics.results.push({
        test: 'Database Connection',
        status: 'fail',
        message: `Connection failed: ${error.message}`,
        details: error
      })
    } else {
      diagnostics.results.push({
        test: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to database'
      })
    }
  } catch (error) {
    diagnostics.results.push({
      test: 'Database Connection',
      status: 'fail',
      message: `Connection error: ${error instanceof Error ? error.message : error}`
    })
  }

  // Test 2: Authentication Status (non-blocking)
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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
        message: 'Auth session missing!',
        details: 'No user currently logged in. This is normal for unauthenticated access.'
      })
    }
  } catch (error) {
    diagnostics.results.push({
      test: 'Authentication',
      status: 'fail',
      message: `Auth check failed: ${error instanceof Error ? error.message : error}`
    })
  }

  // Test 3: Check core tables exist
  const tabl