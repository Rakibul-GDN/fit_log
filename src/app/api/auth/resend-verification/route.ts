import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/prisma';
import { sendVerificationEmail } from '@/lib/services/email-sender';
import crypto from 'crypto';

/** POST: Resend verification email for unverified user */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const { email } = body as { email?: string };

  if (!email) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if user exists
    return NextResponse.json({ success: true, data: {} });
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Email is already verified' } },
      { status: 400 },
    );
  }

  // Delete old tokens
  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: 'EMAIL_VERIFICATION' as never },
  });

  // Create new token
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      type: 'EMAIL_VERIFICATION' as never,
      expiresAt,
    },
  });

  const emailResult = await sendVerificationEmail(email, token);
  if (!emailResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to send verification email' },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: {} });
}
