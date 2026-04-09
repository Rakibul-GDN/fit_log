import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';

/** DELETE: Delete current user account and all associated data */
export async function DELETE(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  // Delete all user data cascade (Prisma schema has onDelete: Cascade on most relations)
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return NextResponse.json(
    { success: true, data: {}, message: 'Account deleted successfully.' },
    { status: 200 },
  );
}
