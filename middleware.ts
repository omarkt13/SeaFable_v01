import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function rateLimit(identifier: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Rate limiting
  const clientIP = req.ip || req.headers.get("x-forwarded-for") || "unknown"
  if (!rateLimit(clientIP)) {
    return new NextResponse("Rate limit exceeded", { status: 429 })
  }

  // Security headers
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("X-XSS-Protection", "1; mode=block")

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://*.supabase.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")

  res.headers.set("Content-Security-Policy", csp)

  // Handle auth routes
  if (
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/business") ||
    req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            res.cookies.set({ name, value: "", ...options })
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protect business routes
    if (req.nextUrl.pathname.startsWith("/business")) {
      // Skip login page itself
      if (req.nextUrl.pathname === "/business/login") {
        return res
      }

      if (!session) {
        return NextResponse.redirect(new URL("/business/login", req.url))
      }

      // Check if user is in host_profiles table (business user)
      const { data: hostProfile, error } = await supabase
        .from("host_profiles")
        .select("id")
        .eq("id", session.user.id)
        .single()

      if (error || !hostProfile) {
        // Not a business user, redirect to home
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Protect customer dashboard routes
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.url))
      }

      // Check if user is a business user (should redirect to business dashboard)
      const { data: hostProfile } = await supabase.from("host_profiles").select("id").eq("id", session.user.id).single()

      if (hostProfile) {
        // Business user trying to access customer dashboard
        return NextResponse.redirect(new URL("/business/home", req.url))
      }

      // Check if user exists in users table
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", session.user.id)
        .single()

      if (userError || !userProfile) {
        // User not found in users table, sign out and redirect
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
