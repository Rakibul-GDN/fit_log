import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const authSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

/** Lazy-load Prisma to avoid build-time initialization */
async function getPrisma(): Promise<PrismaClient> {
  const { prisma } = await import('@/lib/services/prisma');
  return prisma;
}

const nextAuth = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials): Promise<{
        id: string;
        email: string;
        emailVerified: boolean;
      } | null> => {
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
    jwt({ token, user }) {
      if (user) {
        token.emailVerified = (
          user as { emailVerified?: boolean }
        ).emailVerified;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).emailVerified =
          token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export const { GET, POST } = nextAuth.handlers;
