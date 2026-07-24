/**
 * Shared NextAuth secret. Falls back to a development-only value so the app
 * runs locally without any configuration. Always set NEXTAUTH_SECRET in
 * production.
 */
export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';
