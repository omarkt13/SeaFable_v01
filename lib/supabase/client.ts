"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"

// This function creates a new Supabase client instance for client-side operations.
// It's designed to be called within a React component or hook to ensure it's
// initialized correctly in the browser environment.
export function createClient(): SupabaseClient {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
