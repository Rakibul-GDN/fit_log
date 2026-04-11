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
    entries?: { exerciseId: string; setsCompleted: number; repsPerSet: number[]; weightPerSet: number[]; notes?: string | null }[];
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
  let logEntriesData: { exerciseId: string; order: number; setsCompleted: number; repsPerSet: number[]; weightPerSet: number[]; notes: string | null }[];

  if (entries && entries.length > 0) {
    logEntriesData = entries.map((e, i) => ({
      exerciseId: e.exerciseId,
      order: i,
      setsCompleted: e.setsCompleted,
      repsPerSet: e.repsPerSet,
      weightPerSet: e.weightPerSet,
      notes: e.notes ?? null,
    }));
  } else {
    if (routine.exerciseAssignments.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_EXERCISES', message: 'No exercises assigned to this day.' } },
        { status: 400 },
      );
    }
    logEntriesData = routine.exerciseAssignments.map((a, i) => ({
      exerciseId: a.exerciseId,
      order: a.order,
      setsCompleted: a.defaultSets,
      repsPerSet: Array(a.defaultSets).fill(a.defaultReps) as number[],
      weightPerSet: Array(a.defaultSets).fill(a.defaultWeight),
      notes: null,
    }));
  }

  // Normalize workoutDate to start of day for comparison
  const startOfDay = new Date(workoutDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(workoutDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Check if a workout log already exists for this date
  const existingLog = await prisma.workoutLog.findFirst({
    where: {
      userId: session.user.id,
      workoutDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  let workoutLog;

  if (existingLog) {
    // Append entries to existing log
    workoutLog = await prisma.workoutLog.update({
      where: { id: existingLog.id },
      data: {
        // Update dayOfWeek and routineId if not already set
        dayOfWeek: dayOfWeek as never,
        ...(existingLog.routineId === null && { routineId: routine.id }),
        logEntries: { create: logEntriesData },
      },
      include: {
        logEntries: {
          include: { exercise: { select: { id: true, name: true, category: true } } },
        },
      },
    });
  } else {
    // Create new workout log
    workoutLog = await prisma.workoutLog.create({
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
  }

  return NextResponse.json({ success: true, data: workoutLog }, { status: existingLog ? 200 : 201 });
}
