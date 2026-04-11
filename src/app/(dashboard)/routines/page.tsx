'use client';

import { Button } from '@/components/ui/Button';
import { RoutineCard } from '@/components/ui/routine-card';
import { RoutineListSkeleton } from '@/components/feedback/ListSkeletons';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useRoutines, useDeleteRoutine } from '@/hooks/api/useRoutines';
import { useToast } from '@/hooks/ui/useToast';
import Link from 'next/link';
import { useState, useCallback } from 'react';

export default function RoutinesPage(): React.ReactElement {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useRoutines(page, 20);
  const deleteMutation = useDeleteRoutine();
  const toast = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Routine deleted successfully.');
      void refetch();
    } catch {
      toast.error('Failed to delete routine.');
    }
  }, [deleteId, deleteMutation, refetch, toast]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Routines</h1>
          <p className="mt-1 text-muted-foreground">Create and manage your weekly workout routines</p>
        </div>
        <Link className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" href="/routines/create">
          Create Routine
        </Link>
      </div>

      {isLoading && <RoutineListSkeleton />}
      {error && <p className="text-destructive">Failed to load routines.</p>}

      {data?.data && data.data.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-lg text-muted-foreground">No routines yet</p>
          <Link className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" href="/routines/create">
            Create your first routine
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data?.map((routine) => {
          const routineWithAssignments = routine as { exerciseAssignments?: { exerciseId: string; dayOfWeek: string }[] };
          const exerciseCount = routineWithAssignments.exerciseAssignments?.length ?? 0;
          return (
            <RoutineCard key={routine.id} description={routine.description ?? null} exerciseCount={exerciseCount} id={routine.id} name={routine.name} onDelete={() => setDeleteId(routine.id)} />
          );
        })}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'} onClick={() => setPage(p)}>{p}</Button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Delete Routine"
        description="Are you sure you want to delete this routine? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
