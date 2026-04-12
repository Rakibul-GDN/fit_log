import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import { workoutLogSchema } from '@/lib/api/validators';

/** GET: Get workout detail with log entries */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workoutId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { workoutId } = await params;

  const workout = await prisma.workoutLog.findFirst({
    where: { id: workoutId, userId: session.user.id },
    include: {
      logEntries: {
        orderBy: { order: 'asc' },
        include: { exercise: { select: { id: true, name: true, category: true } } },
      },
    },
  });

  if (!workout) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Workout not found.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: workout });
}

/** PATCH: Update workout and entries */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { workoutId } = await params;

  const existing = await prisma.workoutLog.findFirst({
    where: { id: workoutId, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Workout not found.' } },
      { status: 404 },
    );
  }

  const body = await request.json();
  const validation = workoutLogSchema.partial().safeParse(body);

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

  const { dayOfWeek, workoutDate, notes, entries } = validation.data;

  // Update workout with partial data
  const workout = await prisma.$transaction(async (tx) => {
    // Update basic fields
    await tx.workoutLog.update({
      where: { id: workoutId },
      data: {
        ...(dayOfWeek && { dayOfWeek: dayOfWeek as never }),
        ...(workoutDate && { workoutDate }),
        ...(notes !== undefined && { notes }),
      },
    });

    // Partial update entries if provided
    if (entries) {
      // Delete old entries
      await tx.logEntry.deleteMany({
        where: { workoutLogId: workoutId },
      });

      // Create new entries
      if (entries.length > 0) {
        await tx.logEntry.createMany({
          data: entries.map((e) => ({
            workoutLogId: workoutId,
            exerciseId: e.exerciseId,
            setsCompleted: e.setsCompleted,
            repsPerSet: e.repsPerSet,
            weightPerSet: e.weightPerSet,
            notes: e.notes ?? null,
          })),
        });
      }
    }

    // Fetch updated workout with entries
    return tx.workoutLog.findUnique({
      where: { id: workoutId },
      include: {
        logEntries: {
          include: { exercise: { select: { id: true, name: true, category: true } } },
          orderBy: { id: 'asc' },
        },
      },
    });
  });

  return NextResponse.json({ success: true, data: workout });
}

/** DELETE: Delete workout and cascade to entries */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ workoutId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { workoutId } = await params;

  const existing = await prisma.workoutLog.findFirst({
    where: { id: workoutId, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Workout not found.' } },
      { status: 404 },
    );
  }

  await prisma.workoutLog.delete({ where: { id: workoutId } });

  return NextResponse.json({
    success: true,
    data: {},
    message: 'Workout deleted successfully.',
  });
}
