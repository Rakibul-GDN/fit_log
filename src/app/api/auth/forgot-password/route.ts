import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/prisma';
import { generateVerificationToken } from '@/lib/services/email-verification';
import { sendPasswordResetEmail } from '@/lib/services/email-sender';
import { forgotPasswordSchema } from '@/lib/api/validators';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format.',
          },
        },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // Find user (don't reveal whether email exists)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate reset token and send email
      const token = await generateVerificationToken(user.id, 'PASSWORD_RESET');
      const emailResult = await sendPasswordResetEmail(user.email, token);

      if (!emailResult.success) {
        console.error('Failed to send reset email:', emailResult.error);
      }
    }

    // Always return same message regardless of whether email exists
    return NextResponse.json({
      success: true,
      data: {
        message:
          'If an account exists with that email, we have sent a password reset link.',
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
