import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import { paginationSchema, workoutLogSchema } from '@/lib/api/validators';

/** GET: List workouts for authenticated user (paginated, date filterable) */
export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const pagination = paginationSchema.safeParse({
    page: searchParams.get('page') ?? '1',
    limit: searchParams.get('limit') ?? '20',
  });

  const page = pagination.success ? pagination.data.page : 1;
  const limit = pagination.success ? pagination.data.limit : 20;

  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: session.user.id };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (fromDate) where.workoutDate = { ...where.workoutDate, gte: new Date(fromDate) };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (toDate) where.workoutDate = { ...where.workoutDate, lte: new Date(toDate) };

  const [workouts, total] = await Promise.all([
    prisma.workoutLog.findMany({
      where,
      orderBy: { workoutDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        logEntries: {
          orderBy: { order: 'asc' },
          include: { exercise: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.workoutLog.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: workouts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
}

/** POST: Create a manual workout log */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const validation = workoutLogSchema.safeParse(body);

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

  const entryData = entries.map((e, i) => ({
    exerciseId: e.exerciseId,
    order: i,
    setsCompleted: e.setsCompleted,
    repsPerSet: e.repsPerSet,
    weightPerSet: e.weightPerSet,
    notes: e.notes ?? null,
  }));

  let workout;

  if (existingLog) {
    // Append entries to existing log
    workout = await prisma.workoutLog.update({
      where: { id: existingLog.id },
      data: {
        dayOfWeek: dayOfWeek as never,
        ...(notes && { notes }),
        logEntries: { create: entryData },
      },
      include: {
        logEntries: {
          include: { exercise: { select: { id: true, name: true, category: true } } },
        },
      },
    });
  } else {
    // Create new workout log
    workout = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        dayOfWeek: dayOfWeek as never,
        workoutDate,
        notes: notes ?? null,
        logEntries: { create: entryData },
      },
      include: {
        logEntries: {
          include: { exercise: { select: { id: true, name: true, category: true } } },
        },
      },
    });
  }

  return NextResponse.json({ success: true, data: workout }, { status: existingLog ? 200 : 201 });
}
