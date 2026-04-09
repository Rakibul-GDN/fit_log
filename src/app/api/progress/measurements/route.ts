import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';
import { paginationSchema, bodyMeasurementSchema } from '@/lib/api/validators';

/** GET: List body measurements for authenticated user (paginated) */
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

  const [measurements, totalItems] = await Promise.all([
    prisma.bodyMeasurement.findMany({
      where: { userId: session.user.id },
      orderBy: { measurementDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.bodyMeasurement.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    success: true,
    data: measurements,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  });
}

/** POST: Create a new body measurement */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const validation = bodyMeasurementSchema.safeParse(body);

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

  const { measurementType, value, unit, measurementDate, notes } = validation.data;

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId: session.user.id,
      measurementType: measurementType as never,
      value,
      unit: unit as never,
      measurementDate,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ success: true, data: measurement }, { status: 201 });
}
