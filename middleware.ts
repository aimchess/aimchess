// // middleware.ts - FINAL VERSION (Handles case-insensitive roles like "ADMIN" or "admin")

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. If user is logged in → kick them OUT of login/signup pages
  if (token && (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup"))) {
    let role = token.role as string;

    // FIX: Normalize role to lowercase for case-insensitivity
    role = role.toLowerCase();

    if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "coach") return NextResponse.redirect(new URL("/coach", req.url));
    return NextResponse.redirect(new URL("/learn", req.url));
  }

  // 2. If NOT logged in → protect these routes
  const protectedRoutes = ["/learn", "/coach", "/admin", "/puzzle", "/payment"];
  if (!token && protectedRoutes.some((r) => pathname.startsWith(r))) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // 3. Role-based access control (ONLY IF LOGGED IN)
  if (token) {
    let role = token.role as string;

    // FIX: Normalize role to lowercase
    role = role.toLowerCase();

    // Block non-admins from /admin
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/learn", req.url));
    }

    // Block non-coaches (and non-admins) from /coach
    if (pathname.startsWith("/coach") && role !== "coach" && role !== "admin") {
      return NextResponse.redirect(new URL("/learn", req.url));
    }
  }

  // Everything else → allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
// export { default } from 'next-auth/middleware'
// export const config = {
// matcher: []
// }