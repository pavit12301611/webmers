/**
 * Auth helpers shared across the app (server components, route handlers and
 * middleware).
 */
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';
import { hasConfiguredAuthSecret } from './secret';

export { authOptions };
export { getAuthSecret, hasConfiguredAuthSecret, tryGetAuthSecret } from './secret';

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
};

let warnedAboutSecret = false;

/**
 * Reads the session without letting a misconfigured secret take down public
 * pages.
 *
 * If NEXTAUTH_SECRET is missing in production, signing/verifying is impossible,
 * so there is no trustworthy session — we surface `null` (signed out) instead
 * of throwing. That fails *closed*: protected routes still redirect, nothing is
 * granted, and the misconfiguration is logged loudly and reported on the admin
 * dashboard. `/api/auth/*` continues to error so the problem is unmissable.
 */
async function readSession() {
  try {
    return await getServerSession(authOptions);
  } catch (err) {
    // Next.js signals "this route must render dynamically" by throwing. That is
    // control flow, not a failure — swallowing it would break static/dynamic
    // detection and bail-out behaviour, so re-throw it untouched.
    if (isNextControlFlowError(err)) throw err;

    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.error(
        '[auth] Could not read session — treating all requests as signed out. ' +
          'This is almost always a missing or invalid NEXTAUTH_SECRET.',
        err,
      );
    }
    return null;
  }
}

/**
 * Detects Next.js's internal control-flow errors (dynamic-server usage,
 * redirect(), notFound()), which must propagate rather than be handled.
 */
function isNextControlFlowError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const digest = (err as { digest?: unknown }).digest;
  if (typeof digest !== 'string') return false;
  return (
    digest === 'DYNAMIC_SERVER_USAGE' ||
    digest === 'NEXT_NOT_FOUND' ||
    digest.startsWith('NEXT_REDIRECT')
  );
}

/** Returns the current session on the server, or `null`. */
export async function getSession() {
  return readSession();
}

/** Returns the signed-in user on the server, or `null`. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await readSession();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    role: session.user.role,
  };
}

/**
 * True when auth is usable. Handy for surfacing configuration problems in the
 * UI rather than failing silently.
 */
export function isAuthConfigured(): boolean {
  return process.env.NODE_ENV !== 'production' || hasConfiguredAuthSecret();
}
