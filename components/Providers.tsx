'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Client providers for the app. Wraps children in the NextAuth SessionProvider
 * so `useSession` works anywhere in the tree.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
