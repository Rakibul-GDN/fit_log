import { NextResponse } from 'next/server';
import type { DayOfWeek } from '@prisma/client';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';

/** POST: Create a workout log from a routine day.
 *  Accepts entries from request body (user-edited) or falls back to routine defaults. */
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
  const body = (await request.json()) as {
    dayOfWeek?: string;
    workoutDate?: string;
    entries?: { exerciseId: string; setsCompleted: number; repsPerSet: number[]; weight: number; notes?: string | null }[];
  };
  const dayOfWeek = body.dayOfWeek as DayOfWeek | undefined;
  const workoutDate = body.workoutDate ? new Date(body.workoutDate) : new Date();
  const entries = body.entries;

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

  // If entries provided, use them. Otherwise fall back to routine defaults.
  let logEntriesData: { exerciseId: string; setsCompleted: number; repsPerSet: number[]; weight: number; notes: string | null }[];

  if (entries && entries.length > 0) {
    logEntriesData = entries.map((e) => ({
      exerciseId: e.exerciseId,
      setsCompleted: e.setsCompleted,
      repsPerSet: e.repsPerSet,
      weight: e.weight,
      notes: e.notes ?? null,
    }));
  } else {
    if (routine.exerciseAssignments.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_EXERCISES', message: 'No exercises assigned to this day.' } },
        { status: 400 },
      );
    }
    logEntriesData = routine.exerciseAssignments.map((a) => ({
      exerciseId: a.exerciseId,
      setsCompleted: a.defaultSets,
      repsPerSet: Array(a.defaultReps).fill(a.defaultReps) as number[],
      weight: a.defaultWeight,
      notes: null,
    }));
  }

  const workoutLog = await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      routineId: routine.id,
      dayOfWeek: dayOfWeek as never,
      workoutDate,
      logEntries: { create: logEntriesData },
    },
    include: {
      logEntries: {
        include: { exercise: { select: { id: true, name: true, category: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, data: workoutLog }, { status: 201 });
}
