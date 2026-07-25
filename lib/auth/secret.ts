/**
 * Shared NextAuth secret.
 *
 * SECURITY: there is deliberately **no** hardcoded production fallback here.
 * A committed default secret lets anyone forge a session cookie for any user
 * and role (full admin takeover), so in production a missing NEXTAUTH_SECRET
 * is a fatal misconfiguration rather than something we silently paper over.
 *
 * In development we fall back to a fixed, obviously-local value so `npm run
 * dev` still works with zero configuration.
 *
 * This module is imported by `middleware.ts`, which runs on the Edge runtime,
 * so it must stay free of Node built-ins (`crypto`, `fs`, `process.cwd`).
 */

const DEV_FALLBACK = 'webmers-local-development-only-do-not-deploy';

function resolveSecret(): string {
  const configured = process.env.NEXTAUTH_SECRET?.trim();

  if (configured) {
    // The old placeholder was committed to the repository, so anyone could
    // use it to mint valid sessions. Refuse it outright.
    if (
      configured === 'dev-secret-change-in-production' ||
      configured === 'replace-with-random-secret'
    ) {
      throw new Error(
        'NEXTAUTH_SECRET is set to a known placeholder value. ' +
          'Generate a real secret with: openssl rand -base64 32',
      );
    }
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXTAUTH_SECRET is required in production. Sessions cannot be signed ' +
        'securely without it. Generate one with: openssl rand -base64 32',
    );
  }

  return DEV_FALLBACK;
}

export const AUTH_SECRET = resolveSecret();
