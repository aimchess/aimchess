// middleware.ts - Strict Role-Based CRM Access Control

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require ADMIN role
const ADMIN_ONLY_ROUTES = [
  "/crm/dashboard",
  "/crm/students",
  "/crm/batches",
  "/crm/payments",
  "/crm/attendance",
  "/crm/courses",
  "/crm/analysis",
  "/crm/syllabus",
];

// Routes accessible by COACH (and ADMIN)
const COACH_ROUTES = [
  "/crm/coach-dashboard",
  "/crm/coach-students",
  "/crm/coach-attendance",
  "/crm/coach-library",
  "/crm/coach-analysis",
  "/crm/coach-reports",
];

// Routes accessible by STUDENT (and ADMIN)
const STUDENT_ROUTES = [
  "/crm/student-dashboard",
  "/crm/student-todo",
  "/crm/student-history",
  "/crm/student-library",
  "/crm/student-mcq",
  "/crm/student-fees",
  "/crm/student-schedule",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userRole = ((token?.role as string) || "").toUpperCase();

  const getRoleDashboard = (role: string) => {
    if (role === "COACH") return "/crm/coach-dashboard";
    if (role === "STUDENT") return "/crm/student-dashboard";
    return "/crm/dashboard";
  };

  // CRM public pages (login/signup) — redirect authenticated users to their role-specific dashboard
  if (token && (pathname.startsWith("/crm/login") || pathname.startsWith("/crm/signup"))) {
    return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
  }

  // CRM protected pages — require login
  if (!token && pathname.startsWith("/crm") && !pathname.startsWith("/crm/login") && !pathname.startsWith("/crm/signup")) {
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  // Role-Based Access Control for CRM routes
  if (token && pathname.startsWith("/crm")) {
    // Check Admin-only routes
    if (ADMIN_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
      if (userRole !== "ADMIN") {
        return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
      }
    }

    // Check Coach routes (COACH or ADMIN allowed)
    if (COACH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
      if (userRole !== "COACH" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
      }
    }

    // Check Student routes (STUDENT or ADMIN allowed)
    if (STUDENT_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
      if (userRole !== "STUDENT" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
      }
    }
  }

  // Allow authenticated users to access puzzle and MCQ solver pages
  if (token && (pathname.startsWith("/puzzle") || pathname.startsWith("/mcq"))) {
    return NextResponse.next();
  }

  // Redirect non-CRM routes to role-specific CRM dashboard
  if (!pathname.startsWith("/crm")) {
    if (token) {
      return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
    }
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|aim-logo.jpeg).*)" ],
};
