import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import { routineSchema } from '@/lib/api/validators';

/** GET: Get routine detail with exercise assignments */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ routineId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { routineId } = await params;

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: session.user.id },
    include: {
      exerciseAssignments: {
        include: { exercise: { select: { id: true, name: true, category: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!routine) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Routine not found.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: routine });
}

/** PATCH: Update routine and its exercise assignments */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ routineId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { routineId } = await params;

  // Verify ownership
  const existing = await prisma.routine.findFirst({
    where: { id: routineId, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Routine not found.' } },
      { status: 404 },
    );
  }

  const body = await request.json();
  const validation = routineSchema.partial().safeParse(body);

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

  const { name, description, assignments } = validation.data;

  // Update routine with partial data
  const routine = await prisma.$transaction(async (tx) => {
    // Update basic fields
    await tx.routine.update({
      where: { id: routineId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    // Partial update assignments if provided
    if (assignments) {
      // Delete removed assignments
      await tx.exerciseAssignment.deleteMany({
        where: { routineId },
      });

      // Create new assignments
      if (assignments.length > 0) {
        await tx.exerciseAssignment.createMany({
          data: assignments.map((a) => ({
            routineId,
            exerciseId: a.exerciseId,
            dayOfWeek: a.dayOfWeek,
            defaultSets: a.defaultSets,
            defaultReps: a.defaultReps,
            defaultWeight: a.defaultWeight,
            order: a.order,
          })),
        });
      }
    }

    // Fetch updated routine with assignments
    return tx.routine.findUnique({
      where: { id: routineId },
      include: {
        exerciseAssignments: {
          include: { exercise: { select: { id: true, name: true, category: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });
  });

  return NextResponse.json({ success: true, data: routine });
}

/** DELETE: Soft-delete routine (cascade deletes assignments) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ routineId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { routineId } = await params;

  // Verify ownership
  const existing = await prisma.routine.findFirst({
    where: { id: routineId, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Routine not found.' } },
      { status: 404 },
    );
  }

  await prisma.routine.update({
    where: { id: routineId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    data: {},
    message: 'Routine deleted successfully.',
  });
}
