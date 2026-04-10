import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';

/** DELETE: Soft-delete user-custom exercise */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { exerciseId } = await params;

  // Verify ownership (can only delete user's own exercises)
  const existing = await prisma.exercise.findFirst({
    where: { id: exerciseId, createdById: session.user.id, isSystemExercise: false },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found or cannot be deleted.' } },
      { status: 404 },
    );
  }

  // Soft delete
  await prisma.exercise.update({
    where: { id: exerciseId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    data: {},
    message: 'Exercise deleted successfully.',
  });
}
