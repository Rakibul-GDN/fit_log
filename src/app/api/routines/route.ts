import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import { paginationSchema, routineSchema } from '@/lib/api/validators';

/** GET: List routines for authenticated user (paginated) */
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

  const [routines, totalItems] = await Promise.all([
    prisma.routine.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        exerciseAssignments: {
          include: { exercise: { select: { id: true, name: true, category: true } } },
        },
      },
    }),
    prisma.routine.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    success: true,
    data: routines,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  });
}

/** POST: Create a new routine with exercise assignments */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const validation = routineSchema.safeParse(body);

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

  const routine = await prisma.routine.create({
    data: {
      userId: session.user.id,
      name,
      description: description ?? null,
      exerciseAssignments: {
        create: assignments.map((a) => ({
          exerciseId: a.exerciseId,
          dayOfWeek: a.dayOfWeek,
          defaultSets: a.defaultSets,
          defaultReps: a.defaultReps,
          defaultWeight: a.defaultWeight,
          order: a.order,
        })),
      },
    },
    include: {
      exerciseAssignments: {
        include: { exercise: { select: { id: true, name: true, category: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, data: routine }, { status: 201 });
}
