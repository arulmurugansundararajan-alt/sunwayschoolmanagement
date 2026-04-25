/**
 * API route authentication helpers.
 *
 * Usage in any route handler:
 *
 *   const authResult = await requireAuth(request);
 *   if (!authResult.ok) return authResult.response;
 *   const { session } = authResult;
 *
 *   const adminResult = await requireAdmin(request);
 *   if (!adminResult.ok) return adminResult.response;
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export interface AuthOk {
  ok: true;
  session: Awaited<ReturnType<typeof getServerSession>>;
}

export interface AuthFail {
  ok: false;
  response: NextResponse;
}

export type AuthResult = AuthOk | AuthFail;

/** Require any authenticated session */
export async function requireAuth(_req?: NextRequest): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { ok: true, session };
}

/** Require admin role */
export async function requireAdmin(_req?: NextRequest): Promise<AuthResult> {
  const result = await requireAuth(_req);
  if (!result.ok) return result;

  const role = (result.session?.user as { role?: string })?.role;
  if (role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return result;
}

/** Require admin or staff role */
export async function requireStaff(_req?: NextRequest): Promise<AuthResult> {
  const result = await requireAuth(_req);
  if (!result.ok) return result;

  const role = (result.session?.user as { role?: string })?.role;
  if (!["admin", "staff"].includes(role ?? "")) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return result;
}
