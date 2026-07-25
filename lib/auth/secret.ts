/**
 * Shared NextAuth secret.
 *
 * SECURITY: there is deliberately **no** hardcoded production fallback. A
 * committed default secret lets anyone forge a session cookie for any user and
 * role (full admin takeover), so in production a missing NEXTAUTH_SECRET is a
 * fatal misconfiguration rather than something we silently paper over.
 *
 * IMPORTANT: resolution is **lazy**. `next build` imports every route module to
 * collect page data, so validating at module scope would abort the build on any
 * host that only injects secrets at runtime. The check therefore runs on first
 * *use* (i.e. when a request actually needs to sign or verify a token).
 *
 * This module is imported by `middleware.ts`, which runs on the Edge runtime,
 * so it must stay free of Node built-ins (`crypto`, `fs`, `process.cwd`).
 */

const DEV_FALLBACK = 'webmers-local-development-only-do-not-deploy';

/** Placeholder used only while `next build` collects page data. */
const BUILD_PLACEHOLDER = 'webmers-build-phase-placeholder-never-used-at-runtime';

/** Secrets that were once committed to this repo and must never be accepted. */
const KNOWN_PLACEHOLDERS = new Set([
  'dev-secret-change-in-production',
  'replace-with-random-secret',
]);

const GENERATE_HINT = 'Generate one with: openssl rand -base64 32';

/** True while Next.js is building (importing modules, not serving traffic). */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

let cached: string | null = null;

/**
 * Returns the signing secret.
 *
 * @throws in production at **runtime** when NEXTAUTH_SECRET is missing.
 */
export function getAuthSecret(): string {
  if (cached) return cached;

  const configured = process.env.NEXTAUTH_SECRET?.trim();

  if (configured) {
    if (KNOWN_PLACEHOLDERS.has(configured)) {
      throw new Error(
        `NEXTAUTH_SECRET is set to a known placeholder value. ${GENERATE_HINT}`,
      );
    }
    if (configured.length < 16) {
      throw new Error(
        `NEXTAUTH_SECRET is too short to be secure (needs 16+ characters). ${GENERATE_HINT}`,
      );
    }
    cached = configured;
    return cached;
  }

  // Build time: never fail the build for a value that is only needed to serve
  // requests. Intentionally not cached, so runtime re-evaluates properly.
  if (isBuildPhase()) return BUILD_PLACEHOLDER;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXTAUTH_SECRET is required in production. Sessions cannot be signed ' +
        `securely without it. ${GENERATE_HINT}`,
    );
  }

  cached = DEV_FALLBACK;
  return cached;
}

/**
 * Non-throwing variant for callers that must stay available when the secret is
 * missing (e.g. middleware, which would otherwise 500 every public page).
 * Returns `null` instead of throwing; callers treat that as "no valid session".
 */
export function tryGetAuthSecret(): string | null {
  try {
    return getAuthSecret();
  } catch {
    return null;
  }
}

/** True when a usable, explicitly-configured secret is present. */
export function hasConfiguredAuthSecret(): boolean {
  const configured = process.env.NEXTAUTH_SECRET?.trim();
  return (
    !!configured && configured.length >= 16 && !KNOWN_PLACEHOLDERS.has(configured)
  );
}
