import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import { settingsSchema } from '@/lib/api/validators';

/** GET: Return current user settings */
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      preferredUnits: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: user });
}

/** PATCH: Update current user settings */
export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const validation = settingsSchema.safeParse(body);

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

  const { name, email, preferredUnits } = validation.data;

  // Check email uniqueness if changing
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'CONFLICT', message: 'Email address is already in use' },
        },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(preferredUnits !== undefined && { preferredUnits: preferredUnits as never }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      preferredUnits: true,
      emailVerified: true,
    },
  });

  return NextResponse.json(
    { success: true, data: updated, message: 'Settings updated successfully.' },
    { status: 200 },
  );
}
