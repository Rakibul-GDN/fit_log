import crypto from 'crypto';
import { prisma } from '@/lib/services/prisma';

const TOKEN_EXPIRY_HOURS = 24;

/** Generate a verification token for the given user and type */
export async function generateVerificationToken(
  userId: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
): Promise<string> {
  // Invalidate existing active tokens of same type for this user
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type,
      expiresAt: { gt: new Date() },
    },
  });

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type,
      expiresAt,
    },
  });

  return token;
}

/** Validate and consume a verification token */
export async function validateVerificationToken(
  token: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.type !== type || record.expiresAt < new Date()) {
    return null;
  }

  // Delete the token (single-use)
  await prisma.verificationToken.delete({ where: { id: record.id } });

  return record.userId;
}
