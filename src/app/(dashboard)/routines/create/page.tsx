'use client';

import { RoutineForm, type RoutineFormValues } from '@/components/forms/RoutineForm';
import { useCreateRoutine } from '@/hooks/api/useRoutines';
import { useExercises } from '@/hooks/api/useExercises';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

export default function CreateRoutinePage(): React.ReactElement {
  const router = useRouter();
  const { data: exercisesData } = useExercises(1, 100);
  const createMutation = useCreateRoutine();
  const [serverError, setServerError] = useState<string | null>(null);

  const exercises = exercisesData?.data?.map((e) => ({ id: e.id, name: e.name, category: e.category })) ?? [];

  const onSubmit = useCallback(async (data: RoutineFormValues): Promise<void> => {
    setServerError(null);
    try {
      const result = await createMutation.mutateAsync(data);
      const routineId = result.data?.id;
      if (routineId) router.push(`/routines/${routineId}`);
      else router.push('/routines');
    }
    catch (err) { setServerError(err instanceof Error ? err.message : 'Failed to create routine'); }
  }, [createMutation, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Create Routine</h1>
      {serverError && <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{serverError}</div>}
      <RoutineForm exercises={exercises} onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}
