import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

async function isBusinessUser(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("host_profiles").select("id").eq("id", userId).single()
    return !error && !!data
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Security headers
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Handle auth routes
  if (req.nextUrl.pathname.startsWith("/business") || req.nextUrl.pathname.startsWith("/dashboard")) {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protect business routes
    if (req.nextUrl.pathname.startsWith("/business")) {
      if (req.nextUrl.pathname === "/business/login" || req.nextUrl.pathname === "/business/register") {
        return res
      }

      if (!session) {
        return NextResponse.redirect(new URL("/business/login", req.url))
      }

      const isBusiness = await isBusinessUser(supabase, session.user.id)
      if (!isBusiness) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Protect customer dashboard routes
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.url))
      }

      const isBusiness = await isBusinessUser(supabase, session.user.id)
      if (isBusiness) {
        return NextResponse.redirect(new URL("/business/home", req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
