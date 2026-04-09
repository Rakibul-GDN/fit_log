import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/services/prisma';
import { validateVerificationToken } from '@/lib/services/email-verification';
import { resetPasswordSchema } from '@/lib/api/validators';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data.',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { token, password } = validation.data;

    // Validate and consume the token
    const userId = await validateVerificationToken(token, 'PASSWORD_RESET');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired password reset token.',
          },
        },
        { status: 400 },
      );
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password reset successfully. You can now log in.',
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
