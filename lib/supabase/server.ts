import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { cookies } from "next/headers"

// Modified to accept cookieStore as an argument
export function createSupabaseServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // The `cookies()` API can only be used in Server Components, Server Actions and Route Handlers.
          // We're ignoring this error on the client since we'll immediately redirect.
          console.warn("Failed to set cookie on client:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, "", options)
        } catch (error) {
          console.warn("Failed to remove cookie on client:", error)
        }
      },
    },
  })
}
