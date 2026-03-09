// middleware.ts - CRM-only mode: all routes redirect to CRM

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // CRM public pages (login/signup) — redirect authenticated users to CRM dashboard
  if (token && (pathname.startsWith("/crm/login") || pathname.startsWith("/crm/signup"))) {
    return NextResponse.redirect(new URL("/crm/dashboard", req.url));
  }

  // CRM protected pages — require login
  if (!token && pathname.startsWith("/crm") && !pathname.startsWith("/crm/login") && !pathname.startsWith("/crm/signup")) {
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  // All logged-in users (ADMIN, COACH, STUDENT) can access CRM pages
  // No role restriction — role-based UI is handled in the sidebar

  // Redirect all other routes to role-specific CRM dashboard
  if (!pathname.startsWith("/crm")) {
    if (token) {
      const role = (token.role as string || "").toUpperCase();
      if (role === "COACH") return NextResponse.redirect(new URL("/crm/coach-dashboard", req.url));
      if (role === "STUDENT") return NextResponse.redirect(new URL("/crm/student-dashboard", req.url));
      return NextResponse.redirect(new URL("/crm/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|aim-logo.jpeg).*)" ],
};
