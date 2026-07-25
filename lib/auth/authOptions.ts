import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getAuthSecret } from './secret';
import { getUserByEmail, verifyPassword, createUser, type Role } from '@/lib/data';
import { clearRateLimit, rateLimit } from '@/lib/rateLimit';

/**
 * NextAuth configuration.
 *
 * - JWT sessions (stateless, no DB required for session storage).
 * - Credentials provider authenticates against the data layer (in-memory by
 *   default, PostgreSQL/Prisma when configured).
 * - Google OAuth provider (enabled automatically when credentials are set).
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  // Lazy getter: `next build` imports this module to collect page data, so
  // resolving the secret eagerly would abort the build on hosts that inject
  // env vars only at runtime. This is read per-request instead.
  get secret() {
    return getAuthSecret();
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Automatic linking by email alone lets anyone who controls a
            // matching Google address take over an existing credentials
            // account. Opt in explicitly if you accept that trade-off.
            allowDangerousEmailAccountLinking:
              process.env.GOOGLE_ALLOW_ACCOUNT_LINKING === 'true',
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Throttle by address so the login form cannot be used to brute-force
        // a password. Successful sign-in clears the counter.
        const key = `login:${credentials.email.trim().toLowerCase()}`;
        const limit = rateLimit(key, { limit: 10, windowMs: 15 * 60_000 });
        if (!limit.ok) return null;

        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        const valid = await verifyPassword(user, credentials.password);
        if (!valid) return null;
        clearRateLimit(key);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // When signing in via Google, ensure a local user record exists
      if (account?.provider === 'google' && user.email) {
        const existing = await getUserByEmail(user.email);
        if (!existing) {
          // Create a new user from Google profile
          await createUser({
            email: user.email,
            name: user.name || profile?.name || user.email.split('@')[0],
            password: Math.random().toString(36).slice(2) + Date.now(), // random password, never used
            role: 'BUYER',
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as any).role as Role) || 'BUYER';
        const fresh = user.email ? await getUserByEmail(user.email) : null;
        token.sessionVersion = fresh?.sessionVersion ?? 0;
        return token;
      }

      // Re-read the account on refresh so role changes and password resets
      // take effect without waiting for the 30-day token to expire.
      if (token.email) {
        const dbUser = await getUserByEmail(token.email as string);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;

          // A password reset bumps sessionVersion, invalidating older tokens.
          const current = dbUser.sessionVersion ?? 0;
          if ((token.sessionVersion ?? 0) !== current) {
            if (trigger === 'update') {
              token.sessionVersion = current;
            } else {
              return { ...token, invalidated: true };
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Token superseded by a password reset — surface an empty session.
      if ((token as any).invalidated) return { ...session, user: undefined as never };

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) || 'BUYER';
      }
      return session;
    },
  },
};
