import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow access to admin login page
    if (request.nextUrl.pathname === "/admin") {
      return NextResponse.next()
    }

    // Check for admin authentication
    const adminKey = request.cookies.get("adminKey")?.value
    const validAdminKey = process.env.ADMIN_SECRET || "Dsu020311"

    if (!adminKey || adminKey !== validAdminKey) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
