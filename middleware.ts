import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Only handle auth routes
  if (req.nextUrl.pathname.startsWith("/business") || req.nextUrl.pathname.startsWith("/dashboard")) {
    const supabase = createMiddlewareClient({ req, res })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Business routes
    if (req.nextUrl.pathname.startsWith("/business")) {
      if (req.nextUrl.pathname === "/business/login" || req.nextUrl.pathname === "/business/register") {
        return res
      }

      if (!session) {
        return NextResponse.redirect(new URL("/business/login", req.url))
      }

      // Check if user is business
      try {
        const { data } = await supabase.from("host_profiles").select("id").eq("id", session.user.id).single()
        if (!data) {
          return NextResponse.redirect(new URL("/", req.url))
        }
      } catch {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Customer dashboard routes
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.url))
      }

      // Check if user is business (redirect to business dashboard)
      try {
        const { data } = await supabase.from("host_profiles").select("id").eq("id", session.user.id).single()
        if (data) {
          return NextResponse.redirect(new URL("/business/home", req.url))
        }
      } catch {
        // User is not business, continue to customer dashboard
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
