import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';

/** POST: Copy routine day exercises to a new workout log with pre-filled defaults */
export async function POST(
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
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const dayOfWeek = body.dayOfWeek as string;

  if (!dayOfWeek) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Day of week is required.' } },
      { status: 400 },
    );
  }

  // Verify routine ownership
  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: session.user.id },
    include: {
      exerciseAssignments: {
        where: { dayOfWeek: dayOfWeek as never },
        include: { exercise: true },
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

  if (routine.exerciseAssignments.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: 'NO_EXERCISES', message: 'No exercises assigned to this day.' } },
      { status: 400 },
    );
  }

  // Create workout log with entries from routine assignments
  const workoutLog = await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      routineId: routine.id,
      dayOfWeek: dayOfWeek as never,
      workoutDate: new Date(),
      logEntries: {
        create: routine.exerciseAssignments.map((a) => ({
          exerciseId: a.exerciseId,
          setsCompleted: a.defaultSets,
          repsPerSet: Array(a.defaultSets).fill(a.defaultReps) as number[],
          weight: a.defaultWeight,
        })),
      },
    },
    include: {
      logEntries: {
        include: { exercise: { select: { id: true, name: true, category: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, data: workoutLog }, { status: 201 });
}
