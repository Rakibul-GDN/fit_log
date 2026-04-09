'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateExercise } from '@/hooks/api/useExercises';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = [
  'BARBELL',
  'DUMBBELL',
  'MACHINE',
  'CABLE',
  'BODYWEIGHT',
  'KETTLEBELL',
  'RESISTANCE_BAND',
  'OTHER',
] as const;

/** Create custom exercise form page. */
export default function CreateExercisePage(): React.ReactElement {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>(CATEGORIES[0]);
  const [muscles, setMuscles] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateExercise();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Exercise name is required.');
      return;
    }

    const primaryMuscles = muscles
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    if (primaryMuscles.length === 0) {
      setError('At least one muscle group is required.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        primaryMuscles,
      });
      router.push('/exercises');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create exercise.';
      setError(message.includes('401') ? 'You must be logged in to create exercises.' : message);
    }
  };

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Create Custom Exercise</h1>

      {error && (
        <div className='mb-4 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700'>
          {error}
        </div>
      )}

      <form className='space-y-6' onSubmit={handleSubmit}>
        <Input
          label='Exercise Name'
          placeholder='e.g., Dumbbell Hammer Curl'
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />

        <Input
          label='Description (optional)'
          placeholder='Notes about form, technique, etc.'
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        />

        <div>
          <label className='mb-1 block text-sm font-medium'>Category</label>
          <select
            className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Input
          label='Muscle Groups (comma-separated)'
          placeholder='e.g., Biceps, Forearms'
          value={muscles}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMuscles(e.target.value)}
        />

        <div className='flex gap-3'>
          <Button isLoading={createMutation.isPending} type='submit'>
            Create Exercise
          </Button>
          <Link
            className='rounded-md border border-default-200 px-4 py-2 text-sm transition hover:bg-default-100'
            href='/exercises'
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
