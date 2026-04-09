import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const authSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

/** Lazy-load Prisma to avoid build-time initialization */
async function getPrisma() {
  const { prisma } = await import('@/lib/services/prisma');
  return prisma;
}

/** Shared NextAuth configuration */
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = authSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const db = await getPrisma();
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordMatch) return null;

        // Block login if email is not verified
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
    jwt: ({ token, user }: any) => {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        token.emailVerified = user.emailVerified;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
    session: ({ session, token }: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        session.user.id = token.id;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        session.user.emailVerified = token.emailVerified;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
};

/** NextAuth instance — used by route handler */
export const nextAuth = NextAuth(authConfig);

/** Auth helper — used by route handlers and middleware */
export const auth = nextAuth.auth;
