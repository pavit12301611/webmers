import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AUTH_SECRET } from './secret';
import { getUserByEmail, verifyPassword, createUser, type Role } from '@/lib/data';

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
  secret: AUTH_SECRET,
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
            allowDangerousEmailAccountLinking: true,
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
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        const valid = await verifyPassword(user, credentials.password);
        if (!valid) return null;
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

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as any).role as Role) || 'BUYER';
        // Cache the time so we only refresh role from DB every 5 minutes
        token.roleFetchedAt = Date.now();
      } else if (token.email) {
        // Only refresh role from DB every 5 minutes to avoid hitting DB on every request
        const fetchedAt = (token.roleFetchedAt as number) || 0;
        if (Date.now() - fetchedAt > 5 * 60 * 1000) {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.roleFetchedAt = Date.now();
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) || 'BUYER';
      }
      return session;
    },
  },
};
