import { authOptions } from '@/lib/auth/authOptions';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';

// Re-export for use in middleware/pages
export { authOptions };
export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
};
