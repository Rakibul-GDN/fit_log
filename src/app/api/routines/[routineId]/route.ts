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

  // Update routine and replace assignments
  const routine = await prisma.routine.update({
    where: { id: routineId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(assignments && {
        exerciseAssignments: {
          deleteMany: {},
          create: assignments.map((a) => ({
            exerciseId: a.exerciseId,
            dayOfWeek: a.dayOfWeek,
            defaultSets: a.defaultSets,
            defaultReps: a.defaultReps,
            defaultWeight: a.defaultWeight,
            order: a.order,
          })),
        },
      }),
    },
    include: {
      exerciseAssignments: {
        include: { exercise: { select: { id: true, name: true, category: true } } },
        orderBy: { order: 'asc' },
      },
    },
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

  await prisma.routine.delete({ where: { id: routineId } });

  return NextResponse.json({
    success: true,
    data: {},
    message: 'Routine deleted successfully.',
  });
}
