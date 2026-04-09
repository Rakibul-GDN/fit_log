import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/prisma';
import { validateVerificationToken } from '@/lib/services/email-verification';
import { verifyEmailSchema } from '@/lib/api/validators';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid token format.',
          },
        },
        { status: 400 },
      );
    }

    const { token } = validation.data;

    // Validate and consume the token
    const userId = await validateVerificationToken(token, 'EMAIL_VERIFICATION');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired verification token.',
          },
        },
        { status: 400 },
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Email verified successfully. You can now log in.',
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 },
    );
  }
}
