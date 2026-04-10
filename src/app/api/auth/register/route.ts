import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/services/prisma';
import { generateVerificationToken } from '@/lib/services/email-verification';
import { sendVerificationEmail } from '@/lib/services/email-sender';
import { registerSchema } from '@/lib/api/validators';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

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

    const { email, password, name } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'An account with this email already exists.',
          },
        },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
      },
    });

    // Generate verification token and send email
    const token = await generateVerificationToken(user.id, 'EMAIL_VERIFICATION');
    const emailResult = await sendVerificationEmail(user.email, token);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          message: emailResult.success
            ? 'Account created. Please check your email to verify your account.'
            : 'Account created but we could not send the verification email. Please try resending it from the verify email page.',
        },
      },
      { status: 201 },
    );
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
