/**
 * Next.js App Router middleware — centralized route protection.
 *
 * Responsibilities:
 *  1. Redirect unauthenticated users to /login for page routes.
 *  2. Return HTTP 401 JSON for unauthenticated API requests.
 *  3. Enforce role-based access:
 *       /admin/*  → admin only
 *       /staff/*  → admin | staff
 *       /parent/* → admin | parent
 *  4. API routes mirror the same role rules.
 *
 * Public routes (no auth required):
 *   /login, /api/auth/*, /_next/*, /favicon.ico, /logo.png
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(request: NextRequest & { nextauth: { token: Record<string, unknown> | null } }) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;
    const isApi = pathname.startsWith("/api/");

    // Helper to build an unauthorized response
    const deny = (message: string, status: number) =>
      isApi
        ? NextResponse.json({ success: false, error: message }, { status })
        : NextResponse.redirect(new URL("/login?error=unauthorized", request.url));

    // Token is guaranteed to exist here (withAuth already checked),
    // but TypeScript needs the guard.
    if (!token) return deny("Authentication required", 401);

    const role = (token.role as string | undefined) ?? "";

    // ── Admin-only routes ────────────────────────────────────────────────────
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (role !== "admin") return deny("Admin access required", 403);
    }

    // ── Staff / admin routes ─────────────────────────────────────────────────
    if (
      pathname.startsWith("/staff") ||
      pathname.startsWith("/api/staff") ||
      pathname.startsWith("/api/students") ||
      pathname.startsWith("/api/attendance") ||
      pathname.startsWith("/api/marks") ||
      pathname.startsWith("/api/assignments") ||
      pathname.startsWith("/api/events") ||
      pathname.startsWith("/api/fees") ||
      pathname.startsWith("/api/dashboard")
    ) {
      if (!["admin", "staff"].includes(role)) return deny("Staff access required", 403);
    }

    // ── Parent / admin routes ────────────────────────────────────────────────
    if (pathname.startsWith("/parent") || pathname.startsWith("/api/parent")) {
      if (!["admin", "parent"].includes(role)) return deny("Parent access required", 403);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // withAuth will call this to decide whether the token grants access.
      // Returning false triggers a redirect to the signIn page (or 401 for API).
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimization)
     *  - favicon.ico, logo.png, public images
     *  - /login        (auth page)
     *  - /api/auth/*   (NextAuth endpoints)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|public/|login|api/auth).*)",
  ],
};
