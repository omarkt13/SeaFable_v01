import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Declare a global variable to store the Supabase client instance.
// This ensures that the client is truly a singleton across the browser environment.
declare global {
  // eslint-disable-next-line no-var
  var supabaseBrowserClient: SupabaseClient | undefined
}

export function createClient(): SupabaseClient {
  // If a client instance already exists globally, return it.
  if (globalThis.supabaseBrowserClient) {
    return globalThis.supabaseBrowserClient
  }

  // Retrieve environment variables. Provide empty strings as fallbacks
  // to ensure createBrowserClient always receives string arguments,
  // even if the environment variables are not immediately available
  // during certain bundling or hydration phases.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Create a new client instance and store it globally for future use.
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  globalThis.supabaseBrowserClient = client

  return client
}
