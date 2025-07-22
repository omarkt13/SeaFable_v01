import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.https://tvnpwbwvzasvrckvdkff.supabase.co
const supabaseKey = process.env.sb_publishable_uRq-UWg3xAhz6YmH_OrTDg_-9J57hAL\

// Create a single instance to avoid multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  }
  return supabaseInstance
})()