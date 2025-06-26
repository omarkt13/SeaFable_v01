import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseInstance
}

// Export a getter function instead of direct instance
export function getSupabase() {
  return createClient()
}
