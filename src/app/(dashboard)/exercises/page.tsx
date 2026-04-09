'use client';

import { Button } from '@/components/ui/Button';
import { ExerciseCard } from '@/components/ui/ExerciseCard';
import { ExerciseSearchFilter } from '@/components/forms/ExerciseSearchFilter';
import { useExercises } from '@/hooks/api/useExercises';
import Link from 'next/link';
import { useState } from 'react';

/** Exercise library page — browse, search, filter, create custom. */
export default function ExercisesPage(): React.ReactElement {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading, error } = useExercises(page, 20, search || undefined, category || undefined);

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Exercise Library</h1>
          <p className='mt-1 text-default-500'>Browse exercises or create custom ones</p>
        </div>
        <Button as={Link} href='/exercises/create'>
          Add Custom Exercise
        </Button>
      </div>

      <ExerciseSearchFilter
        category={category}
        onCategoryChange={(v) => { setCategory(v); setPage(1); }}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        search={search}
      />

      {isLoading && <p className='mt-6 text-default-400'>Loading exercises...</p>}

      {error && <p className='mt-6 text-danger-600'>Failed to load exercises.</p>}

      {data?.data && data.data.length === 0 && (
        <div className='mt-6 rounded-lg border border-dashed border-default-300 p-8 text-center'>
          <p className='text-lg text-default-500'>No exercises found</p>
          <Button as={Link} className='mt-4' href='/exercises/create'>
            Create your first custom exercise
          </Button>
        </div>
      )}

      <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data?.data?.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            category={exercise.category as string}
            description={exercise.description}
            isSystemExercise={exercise.isSystemExercise}
            name={exercise.name}
            primaryMuscles={exercise.primaryMuscles}
          />
        ))}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className='mt-6 flex justify-center gap-2'>
          {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size='sm'
              onPress={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
