'use client';

import { Button } from '@/components/ui/Button';
import { RoutineCard } from '@/components/ui/RoutineCard';
import { RoutineListSkeleton } from '@/components/feedback/ListSkeletons';
import { useRoutines, useDeleteRoutine } from '@/hooks/api/useRoutines';
import Link from 'next/link';
import { useState } from 'react';

/** Routines list page */
export default function RoutinesPage(): React.ReactElement {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useRoutines(page, 20);
  const deleteMutation = useDeleteRoutine();

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this routine?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>My Routines</h1>
          <p className='mt-1 text-default-500'>Create and manage your weekly workout routines</p>
        </div>
        <Link
          className='rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90'
          href='/routines/create'
        >
          Create Routine
        </Link>
      </div>

      {isLoading && <RoutineListSkeleton />}

      {error && <p className='text-danger-600'>Failed to load routines.</p>}

      {data?.data && data.data.length === 0 && (
        <div className='rounded-lg border border-dashed border-default-300 p-8 text-center'>
          <p className='text-lg text-default-500'>No routines yet</p>
          <Link
            className='mt-4 inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90'
            href='/routines/create'
          >
            Create your first routine
          </Link>
        </div>
      )}

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data?.data?.map((routine) => {
          const exerciseCount = (routine as { exerciseAssignments?: unknown[] }).exerciseAssignments?.length ?? 0;
          return (
            <RoutineCard
              key={routine.id}
              description={routine.description ?? null}
              exerciseCount={exerciseCount}
              id={routine.id}
              name={routine.name}
              onDelete={() => void handleDelete(routine.id)}
            />
          );
        })}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className='mt-6 flex justify-center gap-2'>
          {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size='sm'
              onPress={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
