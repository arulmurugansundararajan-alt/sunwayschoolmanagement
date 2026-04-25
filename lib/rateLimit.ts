/**
 * In-memory rate limiter for login attempts.
 *
 * Suitable for single-instance deployments.
 * For multi-instance / serverless, replace with a Redis adapter.
 *
 * Limits: 5 attempts per IP per 15-minute window.
 * After limit, the identifier is locked for LOCKOUT_MS.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS  = 15 * 60 * 1000; // 15 minutes lockout

const store = new Map<string, RateLimitEntry>();

// Purge stale entries every 5 minutes to prevent unbounded growth
if (typeof globalThis !== "undefined" && typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      const expired = entry.lockedUntil
        ? now > entry.lockedUntil + WINDOW_MS
        : now - entry.firstAttempt > WINDOW_MS;
      if (expired) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the lockout expires (only set when allowed === false) */
  retryAfter?: number;
}

/**
 * Call before processing an authentication attempt.
 * Returns whether the request should proceed.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now  = Date.now();
  const entry = store.get(identifier);

  if (!entry) {
    store.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Still locked?
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }

  // Window expired — reset
  if (now - entry.firstAttempt > WINDOW_MS) {
    store.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Increment
  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    store.set(identifier, entry);
    return { allowed: false, remaining: 0, retryAfter: Math.ceil(LOCKOUT_MS / 1000) };
  }

  store.set(identifier, entry);
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

/**
 * Call after a successful login to clear the attempt counter.
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}
