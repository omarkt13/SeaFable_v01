import { createServerClient } from "@supabase/ssr"
import type { cookies } from "next/headers"

export function createSupabaseServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Context.
          // We're only interested in this for logging purposes.
          console.warn("Failed to set cookie in server context:", error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().delete()` method can only be called in a Server Context.
          // We're only interested in this for logging purposes.
          console.warn("Failed to remove cookie in server context:", error)
        }
      },
    },
  })
}
