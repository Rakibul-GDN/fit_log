'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';

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

export interface RoutineFormProps {
  defaultValues?: Partial<RoutineFormValues>;
  exercises?: { id: string; name: string; category: string }[];
  onSubmit: (data: RoutineFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function RoutineForm({ defaultValues, exercises = [], onSubmit, isSubmitting }: RoutineFormProps): ReactNode {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('MONDAY');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: { name: defaultValues?.name ?? '', description: defaultValues?.description ?? '', assignments: defaultValues?.assignments ?? [] },
  });

  const assignments = watch('assignments');

  useEffect(() => {
    if (defaultValues?.assignments && defaultValues.assignments.length > 0) {
      setValue('assignments', defaultValues.assignments);
    }
  }, [defaultValues?.assignments, setValue]);

  const addAssignment = (): void => {
    if (!selectedExercise) return;
    const current = assignments ?? [];
    setValue('assignments', [...current, { exerciseId: selectedExercise, dayOfWeek: selectedDay, defaultSets: 3, defaultReps: 10, defaultWeight: 0, order: current.length }]);
    setSelectedExercise('');
  };

  const removeAssignment = (index: number): void => {
    const current = assignments ?? [];
    setValue('assignments', current.filter((_, i) => i !== index));
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Routine Name" {...register('name')} />
      {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      <Input label="Description (optional)" {...register('description')} />

      <div>
        <h3 className="mb-2 text-lg font-semibold">Exercises</h3>
        {assignments && assignments.length > 0 ? (
          <ul className="space-y-2">
            {assignments.map((a, i) => (
              <li key={i} className="flex items-center gap-2 rounded bg-muted p-2">
                <span className="flex-1 text-sm">{exercises.find((e) => e.id === a.exerciseId)?.name ?? 'Unknown'} — {a.dayOfWeek.charAt(0) + a.dayOfWeek.slice(1).toLowerCase()}</span>
                <span className="text-xs text-muted-foreground">{a.defaultSets}×{a.defaultReps} @ {a.defaultWeight}kg</span>
                <Button color="destructive" size="sm" onClick={() => removeAssignment(i)}>Remove</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No exercises assigned yet.</p>
        )}
        {errors.assignments && <p className="mt-1 text-sm text-destructive">{errors.assignments.message}</p>}

        <div className="mt-3 space-y-2 rounded border p-3">
          <p className="text-sm font-medium">Add Exercise</p>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name} ({ex.category.replace(/_/g, ' ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as typeof DAYS[number])}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={addAssignment} disabled={!selectedExercise} size="sm">Add</Button>
          </div>
        </div>
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving...' : (defaultValues ? 'Update Routine' : 'Create Routine')}
      </Button>
    </form>
  );
}
