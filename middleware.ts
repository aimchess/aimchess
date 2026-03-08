// middleware.ts - CRM-only mode: all routes redirect to CRM

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ==========================================
  // DEV BYPASS — set DEV_BYPASS=true in .env to skip all auth
  // Remove this when DB is fixed!
  // ==========================================
  if (process.env.DEV_BYPASS === "true") {
    // Still redirect non-CRM routes to CRM dashboard
    if (!pathname.startsWith("/crm")) {
      return NextResponse.redirect(new URL("/crm/dashboard", req.url));
    }
    // Redirect login/signup to dashboard (no need to login)
    if (pathname.startsWith("/crm/login") || pathname.startsWith("/crm/signup")) {
      return NextResponse.redirect(new URL("/crm/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ==========================================
  // NORMAL AUTH FLOW (when DEV_BYPASS is not set)
  // ==========================================
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // CRM public pages (login/signup) — redirect authenticated users to CRM dashboard
  if (token && (pathname.startsWith("/crm/login") || pathname.startsWith("/crm/signup"))) {
    return NextResponse.redirect(new URL("/crm/dashboard", req.url));
  }

  // CRM protected pages — require login
  if (!token && pathname.startsWith("/crm") && !pathname.startsWith("/crm/login") && !pathname.startsWith("/crm/signup")) {
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  // CRM role-based access — only ADMIN and COACH can access CRM dashboard/pages
  if (token && pathname.startsWith("/crm") && !pathname.startsWith("/crm/login") && !pathname.startsWith("/crm/signup")) {
    const role = (token.role as string).toLowerCase();
    if (role !== "admin" && role !== "coach") {
      return NextResponse.redirect(new URL("/crm/login", req.url));
    }
  }

  // ==========================================
  // REDIRECT ALL OTHER ROUTES TO CRM
  // ==========================================
  if (!pathname.startsWith("/crm")) {
    if (token) {
      const role = (token.role as string).toLowerCase();
      if (role === "admin" || role === "coach") {
        return NextResponse.redirect(new URL("/crm/dashboard", req.url));
      }
    }
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
