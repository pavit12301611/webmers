/**
 * Auth helpers shared across the app (server components, route handlers and
 * middleware).
 */
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';

export { authOptions };
export { AUTH_SECRET } from './secret';

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
};

/** Returns the current session on the server, or `null`. */
export function getSession() {
  return getServerSession(authOptions);
}

/** Returns the signed-in user on the server, or `null`. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    role: session.user.role,
  };
}
