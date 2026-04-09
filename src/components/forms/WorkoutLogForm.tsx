'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useExercises } from '@/hooks/api/useExercises';
import type { ReactNode } from 'react';

/** Workout log entry */
export interface WorkoutEntry {
  exerciseId: string;
  exerciseName?: string;
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

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

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

  const [dayOfWeek, setDayOfWeek] = useState(defaultDayOfWeek);
  const [workoutDate, setWorkoutDate] = useState(defaultDate);
  const [notes, setNotes] = useState(defaultNotes);
  const [entries, setEntries] = useState<WorkoutEntry[]>(
    defaultEntries.length > 0
      ? defaultEntries
      : [{ exerciseId: '', setsCompleted: 3, repsPerSet: [10, 10, 10], weight: 0, notes: '' }],
  );

  const updateEntry = (index: number, field: keyof WorkoutEntry, value: unknown): void => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addExercise = (): void => {
    setEntries((prev) => [
      ...prev,
      { exerciseId: '', setsCompleted: 3, repsPerSet: [10], weight: 0, notes: '' },
    ]);
  };

  const removeExercise = (index: number): void => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const validEntries = entries.filter((entry) => entry.exerciseId);
    if (validEntries.length === 0) return;
    void onSubmit({ dayOfWeek, workoutDate, notes, entries: validEntries });
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-sm font-medium' htmlFor='dayOfWeek'>Day of Week</label>
          <select
            id='dayOfWeek'
            className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className='mb-1 block text-sm font-medium' htmlFor='workoutDate'>Date</label>
          <input
            id='workoutDate'
            className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
            type='date'
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Exercises ({entries.length})</h3>
          <Button type='button' size='sm' onPress={addExercise}>
            + Add Exercise
          </Button>
        </div>

        {entries.map((entry, i) => (
          <div className='rounded-lg border border-default-200 bg-card p-4' key={i}>
            <div className='mb-3 flex items-start gap-2'>
              <span className='mt-2 text-sm font-medium text-default-500'>#{i + 1}</span>
              <select
                className='flex-1 rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
                value={entry.exerciseId}
                onChange={(e) => {
                  const ex = exercises.find((ex) => ex.id === e.target.value);
                  updateEntry(i, 'exerciseId', e.target.value);
                  if (ex) updateEntry(i, 'exerciseName', ex.name);
                }}
              >
                <option value=''>Select exercise</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
              {entries.length > 1 && (
                <Button color='danger' size='sm' onPress={() => removeExercise(i)}>
                  ×
                </Button>
              )}
            </div>
            <div className='grid grid-cols-3 gap-3'>
              <Input
                label='Sets'
                type='number'
                value={entry.setsCompleted.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntry(i, 'setsCompleted', parseInt(e.target.value, 10) || 1)}
              />
              <div>
                <label className='mb-1 block text-xs text-default-500'>Reps per set (comma-separated)</label>
                <input
                  className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
                  type='text'
                  value={entry.repsPerSet.join(', ')}
                  onChange={(e) => {
                    const reps = e.target.value.split(',').map((r) => parseInt(r.trim(), 10) || 10);
                    updateEntry(i, 'repsPerSet', reps);
                  }}
                />
              </div>
              <Input
                label='Weight'
                type='number'
                value={entry.weight.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntry(i, 'weight', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className='mb-1 block text-sm font-medium' htmlFor='notes'>Notes (optional)</label>
        <textarea
          id='notes'
          className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
        />
      </div>

      <Button className='w-full' isLoading={isSubmitting} type='submit'>
        Save Workout
      </Button>
    </form>
  );
}
