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
    pageSize: searchParams.get('pageSize') ?? '20',
  });

  const page = pagination.success ? pagination.data.page : 1;
  const pageSize = pagination.success ? pagination.data.pageSize : 20;

  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: session.user.id };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (fromDate) where.workoutDate = { ...where.workoutDate, gte: new Date(fromDate) };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (toDate) where.workoutDate = { ...where.workoutDate, lte: new Date(toDate) };

  const [workouts, totalItems] = await Promise.all([
    prisma.workoutLog.findMany({
      where,
      orderBy: { workoutDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        logEntries: {
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
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
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

  const workout = await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      dayOfWeek: dayOfWeek as never,
      workoutDate,
      notes: notes ?? null,
      logEntries: {
        create: entries.map((e) => ({
          exerciseId: e.exerciseId,
          setsCompleted: e.setsCompleted,
          repsPerSet: e.repsPerSet,
          weight: e.weight,
          notes: e.notes ?? null,
        })),
      },
    },
    include: {
      logEntries: {
        include: { exercise: { select: { id: true, name: true, category: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, data: workout }, { status: 201 });
}
