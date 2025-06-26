import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Singleton pattern to prevent multiple instances and improve performance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Only create a new instance if one doesn't exist
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Optimize auth settings for better performance
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      // Add global options for better performance
      global: {
        headers: {
          'x-my-custom-header': 'seafable-app',
        },
      },
      // Reduce memory usage
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  
  return supabaseInstance
}

// Export a getter function for consistency
export function getSupabase() {
  return createClient()
}

// Reset function for testing or development
export function resetSupabaseClient() {
  supabaseInstance = null
}
