import { NextResponse } from 'next/server';
import { auth } from '@/lib/services/auth';
import { prisma } from '@/lib/services/prisma';

/** DELETE: Delete a body measurement */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ measurementId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const resolvedParams = await params;
  const measurement = await prisma.bodyMeasurement.findUnique({
    where: { id: resolvedParams.measurementId },
  });

  if (!measurement) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Measurement not found' } },
      { status: 404 },
    );
  }

  if (measurement.userId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    );
  }

  await prisma.bodyMeasurement.delete({
    where: { id: resolvedParams.measurementId },
  });

  return NextResponse.json({ success: true, data: {}, message: 'Measurement deleted successfully.' });
}
