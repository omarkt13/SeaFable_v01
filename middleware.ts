import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Get the session from the request headers
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return handleUnauthenticated(request)
    }

    // For business routes, check if user is a business user
    if (request.nextUrl.pathname.startsWith("/business")) {
      // Simple check - in a real app you'd validate the token and check user type
      return NextResponse.next()
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

function handleUnauthenticated(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect business routes to business login
  if (pathname.startsWith("/business") && pathname !== "/business/login" && pathname !== "/business/register") {
    return NextResponse.redirect(new URL("/business/login", request.url))
  }

  // Redirect dashboard to customer login
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/business/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
