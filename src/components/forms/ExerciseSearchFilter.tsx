'use client';

import { Input } from '@/components/ui/Input';
import type { ReactNode } from 'react';

const CATEGORIES = [
  'All',
  'BARBELL',
  'DUMBBELL',
  'MACHINE',
  'CABLE',
  'BODYWEIGHT',
  'KETTLEBELL',
  'RESISTANCE_BAND',
  'OTHER',
] as const;

/** Search filter props */
export interface ExerciseSearchFilterProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

/**
 * ExerciseSearchFilter — search input + category dropdown.
 */
export function ExerciseSearchFilter({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: ExerciseSearchFilterProps): ReactNode {
  return (
    <div className='flex flex-col gap-3 sm:flex-row'>
      <div className='flex-1'>
        <Input
          placeholder='Search exercises...'
          type='search'
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        />
      </div>
      <select
        className='rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat === 'All' ? '' : cat}>
            {cat === 'All' ? 'All Categories' : cat.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}
