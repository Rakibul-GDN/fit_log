'use client';

import { QuickLogReview } from '@/components/forms/QuickLogReview';
import { useQuickLog } from '@/hooks/api/useRoutines';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

/** Quick log page — select day, review/edit pre-filled exercises, save or discard. */
export default function QuickLogPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const routineId = params?.routineId as string;

  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>(DAYS[0]);
  const [logEntries, setLogEntries] = useState<
    { id: string; exerciseId: string; exerciseName: string; setsCompleted: number; repsPerSet: number[]; weight: number; notes: string }[]
  >([]);
  const [step, setStep] = useState<'select' | 'review'>('select');

  const quickLogMutation = useQuickLog();

  const handleStart = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await quickLogMutation.mutateAsync({ routineId, dayOfWeek: selectedDay });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (result.success && result.data) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const entries = (result.data.logEntries ?? []).map((entry: { id: string; exerciseId: string; setsCompleted: number; repsPerSet: number[]; weight: number; notes: string | null; exercise: { name: string } }) => ({
        id: entry.id,
        exerciseId: entry.exerciseId,
        exerciseName: entry.exercise.name,
        setsCompleted: entry.setsCompleted,
        repsPerSet: entry.repsPerSet,
        weight: entry.weight,
        notes: entry.notes ?? '',
      }));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setLogEntries(entries);
      setStep('review');
    }
  };

  const handleDiscard = (): void => {
    setStep('select');
    setLogEntries([]);
  };

  if (step === 'select') {
    return (
      <div className='mx-auto max-w-2xl px-4 py-8'>
        <h1 className='mb-6 text-3xl font-bold'>Quick Log</h1>
        <p className='mb-4 text-default-500'>Select the day you want to log from this routine.</p>

        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Day of Week</label>
            <select
              className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as typeof DAYS[number])}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            className='w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50'
            disabled={quickLogMutation.isPending}
            onClick={() => void handleStart()}
            type='button'
          >
            {quickLogMutation.isPending ? 'Loading...' : 'Start Workout'}
          </button>

          <button
            className='w-full text-sm text-default-500 transition hover:text-foreground'
            onClick={() => router.push(`/routines/${routineId}`)}
            type='button'
          >
            ← Back to Routine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <QuickLogReview
        dayOfWeek={selectedDay}
        entries={logEntries}
        onDiscard={handleDiscard}
        onSave={() => {}}
      />
    </div>
  );
}
