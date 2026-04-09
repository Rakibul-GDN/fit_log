'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExercises } from '@/hooks/api/useExercises';
import { useCreateRoutine } from '@/hooks/api/useRoutines';
import { useRouter } from 'next/navigation';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

const assignmentSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise is required.'),
  dayOfWeek: z.enum(DAYS),
  defaultSets: z.number().int().min(1).max(100),
  defaultReps: z.number().int().min(1).max(500),
  defaultWeight: z.number().min(0),
  order: z.number().int().min(0),
});

const routineFormSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100),
  description: z.string().max(500).optional(),
  assignments: z.array(assignmentSchema).min(1, 'At least one exercise assignment is required.'),
});

type FormValues = z.infer<typeof routineFormSchema>;

/** Create routine page. */
export default function CreateRoutinePage(): React.ReactElement {
  const router = useRouter();
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedDay, setSelectedDay] = useState<(typeof DAYS)[number]>(DAYS[0]);

  const { data: exercisesData } = useExercises(1, 200);
  const exercises = exercisesData?.data ?? [];

  const createMutation = useCreateRoutine();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: {
      name: '',
      description: '',
      assignments: [],
    },
  });

  const assignments = watch('assignments');

  const handleAdd = (): void => {
    if (!selectedExerciseId) return;
    const current = assignments ?? [];
    setValue('assignments', [
      ...current,
      { exerciseId: selectedExerciseId, dayOfWeek: selectedDay, defaultSets: 3, defaultReps: 10, defaultWeight: 0, order: current.length },
    ]);
    setSelectedExerciseId('');
  };

  const removeAssignment = (index: number): void => {
    const current = assignments ?? [];
    setValue('assignments', current.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues): Promise<void> => {
    await createMutation.mutateAsync({
      name: data.name,
      description: data.description,
      assignments: data.assignments,
    });
    router.push('/routines');
  };

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Create Routine</h1>

      <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
        <Input label='Routine Name' {...register('name')} />
        {errors.name && <p className='text-sm text-danger-600'>{errors.name.message}</p>}

        <Input label='Description (optional)' {...register('description')} />

        <div>
          <h3 className='mb-2 text-lg font-semibold'>Exercises</h3>
          {assignments && assignments.length > 0 ? (
            <ul className='space-y-2'>
              {assignments.map((a, i) => (
                <li className='flex items-center gap-2 rounded bg-default-100 p-2' key={i}>
                  <span className='flex-1 text-sm'>
                    {exercises.find((e) => e.id === a.exerciseId)?.name ?? 'Unknown'} — {a.dayOfWeek}
                  </span>
                  <span className='text-xs text-default-500'>
                    {a.defaultSets}×{a.defaultReps} @ {a.defaultWeight}kg
                  </span>
                  <Button color='danger' size='sm' onPress={() => removeAssignment(i)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-default-400'>No exercises assigned yet.</p>
          )}

          {errors.assignments && (
            <p className='mt-1 text-sm text-danger-600'>{errors.assignments.message}</p>
          )}

          <div className='mt-3 flex gap-2'>
            <select
              className='flex-1 rounded border p-2 text-sm'
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            >
              <option value=''>Select exercise</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <select
              className='rounded border p-2 text-sm'
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as (typeof DAYS)[number])}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <Button isDisabled={!selectedExerciseId} onPress={handleAdd}>
              Add
            </Button>
          </div>
        </div>

        <Button className='w-full' isLoading={createMutation.isPending} type='submit'>
          Create Routine
        </Button>
      </form>
    </div>
  );
}
