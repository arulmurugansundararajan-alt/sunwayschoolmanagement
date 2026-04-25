/**
 * POST /api/auth/logout
 *
 * Explicit server-side logout endpoint.
 * Clears all NextAuth session cookies so the browser session is invalidated
 * immediately, even if the client-side signOut() call is not available
 * (e.g., from a native app or programmatic logout).
 *
 * For React clients, prefer calling `signOut()` from `next-auth/react`
 * which will call this endpoint internally and handle the redirect.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie names used by NextAuth (both http and https variants)
const SESSION_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Secure-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
];

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out" });

  // Expire every NextAuth cookie
  for (const name of SESSION_COOKIES) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   0, // expire immediately
    });
  }

  return response;
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
