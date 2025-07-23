import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a singleton client to prevent multiple instances
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export const supabase = supabaseClient || (supabaseClient = createClientComponentClient())