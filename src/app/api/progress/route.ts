import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';

/** GET: Return progress data for all exercises with trend calculations */
export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get('exerciseId');
  const range = searchParams.get('range') ?? '90'; // days
  const daysAgo = parseInt(range, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  // Get all workout log entries for the user within the time range
  const whereClause: Record<string, unknown> = {
    userId: session.user.id,
    workoutDate: { gte: startDate },
  };

  if (exerciseId) {
    whereClause.logEntries = {
      some: { exerciseId },
    };
  }

  const workouts = await prisma.workoutLog.findMany({
    where: whereClause,
    orderBy: { workoutDate: 'asc' },
    include: {
      logEntries: {
        include: {
          exercise: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Group entries by exercise and calculate trends
  const exerciseMap = new Map<
    string,
    {
      exerciseId: string;
      exerciseName: string;
      dataPoints: Array<{
        id: string;
        exerciseId: string;
        exerciseName: string;
        workoutDate: Date;
        weightPerSet: number[];
        volume: number;
        setsCompleted: number;
        repsPerSet: number[];
      }>;
    }
  >();

  for (const workout of workouts) {
    for (const entry of workout.logEntries) {
      const key = entry.exerciseId;
      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, {
          exerciseId: entry.exerciseId,
          exerciseName: entry.exercise.name,
          dataPoints: [],
        });
      }
      const group = exerciseMap.get(key);
      if (!group) continue;
      const volume = entry.weightPerSet.reduce(
        (sum: number, w: number, idx: number) => sum + w * (entry.repsPerSet[idx] || 0),
        0,
      );
      group.dataPoints.push({
        id: entry.id,
        exerciseId: entry.exerciseId,
        exerciseName: entry.exercise.name,
        workoutDate: workout.workoutDate,
        weightPerSet: entry.weightPerSet,
        volume,
        setsCompleted: entry.setsCompleted,
        repsPerSet: entry.repsPerSet,
      });
    }
  }

  // Calculate trends for each exercise
  const progressData = Array.from(exerciseMap.values()).map((group) => {
    const sorted = group.dataPoints.sort(
      (a, b) => new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime(),
    );
    const startWeight = sorted[0]?.weightPerSet.reduce((s: number, w: number) => s + w, 0) ?? 0;
    const currentWeight = sorted[sorted.length - 1]?.weightPerSet.reduce((s: number, w: number) => s + w, 0) ?? 0;
    const changePercent =
      startWeight > 0 ? Math.round(((currentWeight - startWeight) / startWeight) * 10000) / 100 : 0;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (changePercent > 2) trend = 'increasing';
    else if (changePercent < -2) trend = 'decreasing';

    return {
      exerciseId: group.exerciseId,
      exerciseName: group.exerciseName,
      dataPoints: sorted,
      trend,
      startWeight,
      currentWeight,
      changePercent,
    };
  });

  return NextResponse.json({ success: true, data: progressData });
}
