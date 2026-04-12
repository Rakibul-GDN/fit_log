import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';

const EXERCISE_CATEGORIES = ['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER'] as const;

const updateExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(EXERCISE_CATEGORIES).optional(),
  primaryMuscles: z.array(z.string()).min(1, 'At least one muscle group required.').optional(),
});

/** GET: Fetch a single exercise by ID */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { exerciseId } = await params;

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      primaryMuscles: true,
      isSystemExercise: true,
      createdById: true,
    },
  });

  if (!exercise) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: exercise });
}

/** PATCH: Update user-custom exercise (partial update) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { exerciseId } = await params;

  // Verify ownership (can only update user's own exercises)
  const existing = await prisma.exercise.findFirst({
    where: { id: exerciseId, createdById: session.user.id, isSystemExercise: false },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found or cannot be updated.' } },
      { status: 404 },
    );
  }

  const body = await request.json();
  const validation = updateExerciseSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data.',
          details: validation.error.flatten().fieldErrors as Record<string, string[]>,
        },
      },
      { status: 400 },
    );
  }

  const updated = await prisma.exercise.update({
    where: { id: exerciseId },
    data: validation.data,
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      primaryMuscles: true,
      isSystemExercise: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: updated,
    message: 'Exercise updated successfully.',
  });
}

/** DELETE: Soft-delete user-custom exercise */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const { exerciseId } = await params;

  // Verify ownership (can only delete user's own exercises)
  const existing = await prisma.exercise.findFirst({
    where: { id: exerciseId, createdById: session.user.id, isSystemExercise: false },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found or cannot be deleted.' } },
      { status: 404 },
    );
  }

  // Soft delete
  await prisma.exercise.update({
    where: { id: exerciseId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    data: {},
    message: 'Exercise deleted successfully.',
  });
}
