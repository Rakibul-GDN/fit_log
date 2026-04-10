'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER']),
  primaryMuscles: z.array(z.string().min(1)).min(1),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

export default function CreateExercisePage(): React.ReactElement {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', description: '', category: 'BARBELL', primaryMuscles: [''] },
  });

  const onSubmit = useCallback(async (data: ExerciseFormValues): Promise<void> => {
    setServerError(null);
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: { message?: string } };
        setServerError(err.error?.message ?? 'Failed to create exercise');
        return;
      }
      router.push('/exercises');
    } catch {
      setServerError('An unexpected error occurred.');
    }
  }, [router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Create Custom Exercise</h1>
      {serverError && <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{serverError}</div>}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Exercise Name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        <Input label="Description (optional)" {...register('description')} />
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" {...register('category')}>
            {['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER'].map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Primary Muscles (comma-separated)</label>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" {...register('primaryMuscles', { setValueAs: (v: string) => v.split(',').map((s) => s.trim()) })} />
          {errors.primaryMuscles && <p className="text-sm text-destructive">{errors.primaryMuscles.message}</p>}
        </div>
        <div className="flex gap-3">
          <Button type="submit">Create Exercise</Button>
          <Button variant="outline" type="button" onClick={() => router.push('/exercises')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
