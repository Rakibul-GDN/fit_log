'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useExercises } from '@/hooks/api/useExercises';
import type { ReactNode } from 'react';

/** Workout log entry */
export interface WorkoutEntry {
  exerciseId: string;
  setsCompleted: number;
  repsPerSet: number[];
  weight: number;
  notes: string;
}

/** Workout log form props */
export interface WorkoutLogFormProps {
  defaultEntries?: WorkoutEntry[];
  defaultDayOfWeek?: string;
  defaultDate?: string;
  defaultNotes?: string;
  onSubmit: (data: { dayOfWeek: string; workoutDate: string; notes: string; entries: WorkoutEntry[] }) => void | Promise<void>;
  isSubmitting?: boolean;
}

/**
 * WorkoutLogForm — manual exercise entry with add/remove exercises.
 */
export function WorkoutLogForm({
  defaultEntries = [],
  defaultDayOfWeek = 'MONDAY',
  defaultDate = new Date().toISOString().split('T')[0],
  defaultNotes = '',
  onSubmit,
  isSubmitting,
}: WorkoutLogFormProps): ReactNode {
  const { data: exercisesData } = useExercises(1, 200);
  const exercises = exercisesData?.data ?? [];

  const entries = defaultEntries.length > 0 ? defaultEntries : [
    { exerciseId: '', setsCompleted: 3, repsPerSet: [10, 10, 10], weight: 0, notes: '' },
  ];

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const dayOfWeek = formData.get('dayOfWeek') as string;
    const workoutDate = formData.get('workoutDate') as string;
    const notes = formData.get('notes') as string;

    // Gather entries from form
    const entryCount = parseInt(formData.get('entryCount') as string, 10);
    const workoutEntries: WorkoutEntry[] = [];

    for (let i = 0; i < entryCount; i++) {
      const exerciseId = formData.get(`exerciseId-${i}`) as string;
      if (!exerciseId) continue;

      workoutEntries.push({
        exerciseId,
        setsCompleted: parseInt(formData.get(`sets-${i}`) as string, 10) || 3,
        repsPerSet: (formData.get(`reps-${i}`) as string).split(',').map((r) => parseInt(r.trim(), 10) || 10),
        weight: parseFloat(formData.get(`weight-${i}`) as string) || 0,
        notes: (formData.get(`entryNotes-${i}`) as string) || '',
      });
    }

    if (workoutEntries.length === 0) return;

    void onSubmit({ dayOfWeek, workoutDate, notes, entries: workoutEntries });
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <input name='entryCount' type='hidden' value={entries.length} />

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-sm font-medium'>Day of Week</label>
          <select className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm' name='dayOfWeek' defaultValue={defaultDayOfWeek}>
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
              <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <Input label='Date' name='workoutDate' type='date' defaultValue={defaultDate} />
      </div>

      <div className='space-y-4'>
        {entries.map((entry, i) => (
          <div className='rounded-lg border border-default-200 bg-card p-4' key={i}>
            <div className='mb-3'>
              <select className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm' defaultValue={entry.exerciseId} name={`exerciseId-${i}`}>
                <option value=''>Select exercise</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
            <div className='grid grid-cols-3 gap-3'>
              <Input label='Sets' name={`sets-${i}`} type='number' defaultValue={entry.setsCompleted} />
              <Input label='Reps (comma-separated)' name={`reps-${i}`} type='text' defaultValue={entry.repsPerSet.join(', ')} />
              <Input label='Weight (kg)' name={`weight-${i}`} type='number' defaultValue={entry.weight} />
            </div>
          </div>
        ))}
      </div>

      <Input label='Notes (optional)' name='notes' defaultValue={defaultNotes} />

      <Button className='w-full' isLoading={isSubmitting} type='submit'>
        Save Workout
      </Button>
    </form>
  );
}
