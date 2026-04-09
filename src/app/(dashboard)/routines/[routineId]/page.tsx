'use client';

import { Button } from '@/components/ui/Button';
import { RoutineWeekView } from '@/components/layout/RoutineWeekView';
import { useRoutine, useDeleteRoutine } from '@/hooks/api/useRoutines';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

/** Routine detail page with weekly view */
export default function RoutineDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const routineId = params?.routineId as string;

  const { data, isLoading, error } = useRoutine(routineId);
  const deleteMutation = useDeleteRoutine();

  const handleDelete = async (): Promise<void> => {
    if (confirm('Are you sure you want to delete this routine?')) {
      await deleteMutation.mutateAsync(routineId);
      router.push('/routines');
    }
  };

  if (isLoading) return <div className='mx-auto max-w-7xl px-4 py-8'>Loading...</div>;

  if (error) return <div className='mx-auto max-w-7xl px-4 py-8 text-danger-600'>Failed to load routine.</div>;

  const routine = data?.data;

  if (!routine) return <div className='mx-auto max-w-7xl px-4 py-8'>Routine not found.</div>;

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{routine.name}</h1>
          {routine.description && (
            <p className='mt-1 text-default-500'>{routine.description}</p>
          )}
        </div>
        <div className='flex gap-2'>
          <Button as={Link} href={`/routines/${routineId}/quick-log`}>
            Quick Log
          </Button>
          <Button color='danger' onPress={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {'exerciseAssignments' in routine && routine.exerciseAssignments ? (
        <RoutineWeekView assignments={routine.exerciseAssignments as never} />
      ) : (
        <p className='text-default-400'>No exercises assigned to this routine.</p>
      )}
    </div>
  );
}
