'use client';

import { RoutineForm, type RoutineFormValues } from '@/components/forms/RoutineForm';
import { useRoutine, useUpdateRoutine } from '@/hooks/api/useRoutines';
import { useExercises } from '@/hooks/api/useExercises';
import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';

export default function EditRoutinePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const routineId = params?.routineId as string;
  const { data: routineData, isLoading: routineLoading } = useRoutine(routineId);
  const { data: exercisesData } = useExercises(1, 200);
  const updateMutation = useUpdateRoutine();
  const [serverError, setServerError] = useState<string | null>(null);

  const exercises = exercisesData?.data?.map((e) => ({ id: e.id, name: e.name, category: e.category })) ?? [];

  const routine = routineData?.data;

  // Transform routine data into form default values
  const defaultValues = useMemo<Partial<RoutineFormValues> | undefined>(() => {
    if (!routine) return undefined;
    const assignments = (routine as { exerciseAssignments?: Array<{ exerciseId: string; dayOfWeek: string; defaultSets: number; defaultReps: number; defaultWeight: number; order: number }> }).exerciseAssignments ?? [];
    return {
      name: routine.name,
      description: routine.description ?? undefined,
      assignments: assignments.map((a) => ({
        exerciseId: a.exerciseId,
        dayOfWeek: a.dayOfWeek as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY',
        defaultSets: a.defaultSets,
        defaultReps: a.defaultReps,
        defaultWeight: a.defaultWeight,
        order: a.order,
      })),
    };
  }, [routine]);

  const onSubmit = useCallback(async (data: RoutineFormValues): Promise<void> => {
    setServerError(null);
    try {
      await updateMutation.mutateAsync({ routineId, input: data });
      router.push(`/routines/${routineId}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to update routine');
    }
  }, [updateMutation, routineId, router]);

  if (routineLoading) return <div className="mx-auto max-w-3xl px-4 py-8 text-muted-foreground">Loading routine...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Routine</h1>
      {serverError && <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{serverError}</div>}
      <RoutineForm
        defaultValues={defaultValues}
        exercises={exercises}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
