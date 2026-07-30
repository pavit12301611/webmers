import { NextResponse } from 'next/server';

/**
 * Small, dependency-free protection for public write endpoints. For a
 * multi-instance deployment replace this with a shared store (for example
 * Upstash Redis, Cloudflare KV, or the platform's rate-limit service).
 */
type RateLimitEntry = { count: number; resetAt: number };
const rateLimits = new Map<string, RateLimitEntry>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(request: Request, namespace: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${namespace}:${clientKey(request)}`;
  const current = rateLimits.get(key);
  const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  entry.count += 1;
  rateLimits.set(key, entry);

  // Prevent unbounded growth in long-lived development processes.
  if (rateLimits.size > 10_000) {
    for (const [storedKey, stored] of Array.from(rateLimits.entries())) {
      if (stored.resetAt <= now) rateLimits.delete(storedKey);
    }
  }

  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment and try again.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } },
  );
}

/** Reject cross-site browser writes while allowing native clients and server calls. */
export function isTrustedMutation(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!host) return false;
  const protocol = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '');
  return origin === `${protocol}://${host}`;
}

export function mutationDeniedResponse() {
  return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
}

export function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
