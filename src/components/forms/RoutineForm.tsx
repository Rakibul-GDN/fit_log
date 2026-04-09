'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ReactNode } from 'react';

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

export type RoutineFormValues = z.infer<typeof routineFormSchema>;

/** Routine form props */
export interface RoutineFormProps {
  defaultValues?: Partial<RoutineFormValues>;
  exercises?: { id: string; name: string; category: string }[];
  onSubmit: (data: RoutineFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

/**
 * RoutineForm — name, description, and exercise assignment builder.
 */
export function RoutineForm({
  defaultValues,
  exercises = [],
  onSubmit,
  isSubmitting,
}: RoutineFormProps): ReactNode {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      assignments: defaultValues?.assignments ?? [],
    },
  });

  const assignments = watch('assignments');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addAssignment = (dayOfWeek: (typeof DAYS)[number], exerciseId: string): void => {
    const current = assignments ?? [];
    setValue('assignments', [
      ...current,
      { exerciseId, dayOfWeek, defaultSets: 3, defaultReps: 10, defaultWeight: 0, order: current.length },
    ]);
  };

  const removeAssignment = (index: number): void => {
    const current = assignments ?? [];
    setValue(
      'assignments',
      current.filter((_, i) => i !== index),
    );
  };

  return (
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
          <select className='rounded border p-2 text-sm' onChange={(_e) => {}}>
            <option value=''>Select exercise</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <select className='rounded border p-2 text-sm'>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button className='w-full' isLoading={isSubmitting} type='submit'>
        {defaultValues ? 'Update Routine' : 'Create Routine'}
      </Button>
    </form>
  );
}
