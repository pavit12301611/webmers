/**
 * Lightweight in-process rate limiter (fixed window).
 *
 * This protects the auth and write endpoints from brute-force and flooding.
 * It is intentionally dependency-free so the app still runs with zero setup.
 *
 * NOTE: state lives in this process only. Behind multiple instances you want a
 * shared store (Redis / Upstash) — swap `hit()` for a distributed counter and
 * every call site keeps working unchanged.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const g = globalThis as unknown as { __webmersRateLimit?: Map<string, Bucket> };

function buckets(): Map<string, Bucket> {
  if (!g.__webmersRateLimit) g.__webmersRateLimit = new Map();
  return g.__webmersRateLimit;
}

let lastSweep = 0;

/** Drop expired buckets occasionally so the map cannot grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  const map = buckets();
  const expired: string[] = [];
  map.forEach((bucket, key) => {
    if (bucket.resetAt <= now) expired.push(key);
  });
  expired.forEach((key) => map.delete(key));
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets (only meaningful when `ok` is false). */
  retryAfter: number;
}

/**
 * Records a hit against `key` and reports whether it is allowed.
 */
export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const map = buckets();
  const existing = map.get(key);

  if (!existing || existing.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1, retryAfter: 0 };
  }

  existing.count += 1;

  if (existing.count > options.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: options.limit - existing.count, retryAfter: 0 };
}

/** Clears a bucket — call after a successful login/reset so honest users reset. */
export function clearRateLimit(key: string): void {
  buckets().delete(key);
}

/**
 * Best-effort client IP. Falls back to a constant so the limiter degrades to a
 * global cap rather than silently allowing everything.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfter: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter),
    },
  });
}
