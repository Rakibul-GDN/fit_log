import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import type { DayOfWeek } from '@prisma/client';

/** GET: Preview exercises for a routine day WITHOUT creating a workout log.
 *  Returns the exercise assignments for the specified day so the user can review/edit before saving. */
export async function GET(
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

  const { searchParams } = new URL(request.url);
  const dayOfWeek = searchParams.get('dayOfWeek') as DayOfWeek | null;

  if (!dayOfWeek) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'dayOfWeek query param is required' } },
      { status: 400 },
    );
  }

  const { routineId } = await params;

  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      userId: session.user.id,
    },
    include: {
      exerciseAssignments: {
        where: { dayOfWeek },
        include: {
          exercise: { select: { id: true, name: true, category: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!routine) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Routine not found' } },
      { status: 404 },
    );
  }

  if (routine.exerciseAssignments.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: 'NO_EXERCISES', message: `No exercises assigned for ${dayOfWeek}` } },
      { status: 404 },
    );
  }

  const entries = routine.exerciseAssignments.map((a) => ({
    exerciseId: a.exerciseId,
    exerciseName: a.exercise.name,
    setsCompleted: a.defaultSets,
    repsPerSet: Array(a.defaultSets).fill(a.defaultReps) as number[],
    weightPerSet: Array(a.defaultSets).fill(a.defaultWeight),
    notes: null as string | null,
  }));

  return NextResponse.json({ success: true, data: { routineName: routine.name, dayOfWeek, entries } });
}
