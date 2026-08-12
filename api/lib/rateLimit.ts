/**
 * Simple in-memory rate limiter for brute-force protection.
 * Uses a sliding window per IP. Not distributed (Vercel serverless),
 * but provides basic protection against rapid-fire attacks.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check if a request should be rate limited.
 * @param ip - Client IP address
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 60_000
): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Get remaining attempts and reset time for rate limit headers.
 */
export function getRateLimitInfo(ip: string, maxRequests: number = 5): {
  remaining: number;
  reset: number;
} {
  const entry = store.get(ip);
  if (!entry) return { remaining: maxRequests, reset: 0 };
  return {
    remaining: Math.max(0, maxRequests - entry.count),
    reset: entry.resetAt,
  };
}

/**
 * Rate limit middleware for Vercel serverless functions.
 * Usage: wrap your handler with rateLimit({ maxRequests: 5, windowMs: 60000 })
 */
export function withRateLimit(options: {
  maxRequests?: number;
  windowMs?: number;
}) {
  const { maxRequests = 5, windowMs = 60_000 } = options;

  return (
    req: { headers: Record<string, string | undefined>; socket?: { remoteAddress?: string } },
    res: {
      status: (code: number) => { json: (data: unknown) => void };
      setHeader: (key: string, value: string) => void;
    },
    next: () => Promise<void>
  ) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const allowed = checkRateLimit(ip, maxRequests, windowMs);
    const info = getRateLimitInfo(ip, maxRequests);

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(info.remaining));
    res.setHeader('X-RateLimit-Reset', String(info.reset));

    if (!allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Maximum ${maxRequests} attempts per ${windowMs / 1000} seconds. Please try again later.`,
      });
    }

    return next();
  };
}