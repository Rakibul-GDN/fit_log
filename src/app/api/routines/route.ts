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
    limit: searchParams.get('limit') ?? '20',
  });

  const page = pagination.success ? pagination.data.page : 1;
  const limit = pagination.success ? pagination.data.limit : 20;

  try {
    const [routines, total] = await Promise.all([
      prisma.routine.findMany({
        where: { userId: session.user.id, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          exerciseAssignments: {
            include: { exercise: { select: { id: true, name: true, category: true } } },
          },
        },
      }),
      prisma.routine.count({ where: { userId: session.user.id, deletedAt: null } }),
    ]);

    return NextResponse.json({
      success: true,
      data: routines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[GET /api/routines] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch routines.' } },
      { status: 500 },
    );
  }
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
