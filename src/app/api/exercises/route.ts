import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import { paginationSchema, exerciseSchema } from '@/lib/api/validators';

/** GET: List exercises (system + user's custom), with search/category filter */
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
  const search = searchParams.get('search')?.trim() ?? '';
  const category = searchParams.get('category') ?? '';

  const where: Record<string, unknown> = {
    deletedAt: null,
    OR: [
      { isSystemExercise: true },
      { isSystemExercise: false, createdById: session.user.id },
    ],
  };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' as const };
  }

  if (category) {
    where.category = category;
  }

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      orderBy: [{ isSystemExercise: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        primaryMuscles: true,
        isSystemExercise: true,
        createdById: true,
      },
    }),
    prisma.exercise.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: exercises,
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

/** POST: Create a custom exercise for the authenticated user */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const validation = exerciseSchema.safeParse(body);

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

  const { name, description, category, primaryMuscles } = validation.data;

  const exercise = await prisma.exercise.create({
    data: {
      name,
      description: description ?? null,
      category,
      primaryMuscles,
      isSystemExercise: false,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: exercise }, { status: 201 });
}
