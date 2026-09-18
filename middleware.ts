// middleware.ts - Strict Role-Based CRM Access Control

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require ADMIN role
const ADMIN_ONLY_ROUTES = [
  "/crm/dashboard",
  "/crm/admissions",
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

  // Middleware only protects CRM paths (/crm/*)
  if (!pathname.startsWith("/crm")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userRole = ((token?.role as string) || "").toUpperCase();

  const getRoleDashboard = (role: string) => {
    if (role === "COACH") return "/crm/coach-dashboard";
    if (role === "STUDENT") return "/crm/student-dashboard";
    return "/crm/dashboard";
  };

  // Allow unauthenticated access to /crm/login and /crm/signup
  if (!token && (pathname === "/crm/login" || pathname === "/crm/signup")) {
    return NextResponse.next();
  }

  // Redirect authenticated users trying to access login/signup to their dashboard
  if (token && (pathname === "/crm/login" || pathname === "/crm/signup")) {
    return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
  }

  // If user is not logged in and trying to access any protected CRM route -> redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  // Role-Based Access Control for CRM routes
  if (ADMIN_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
    }
  }

  if (COACH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    if (userRole !== "COACH" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
    }
  }

  if (STUDENT_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    if (userRole !== "STUDENT" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(getRoleDashboard(userRole), req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*"],
};

