import { supabase } from "@/lib/supabase"

// Simple wrapper to maintain compatibility
export function getClientSupabase() {
  return supabase
}

// Export as default as well for flexibility
export default supabase
