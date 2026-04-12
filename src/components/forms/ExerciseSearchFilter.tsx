'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExerciseSearchFilterProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function ExerciseSearchFilter({ search, category, onSearchChange, onCategoryChange }: ExerciseSearchFilterProps) {
  const categories = ['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER'];

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex-1 min-w-48">
        <Input placeholder="Search exercises..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      <div className="w-48">
        <Label htmlFor="category">Category</Label>
        <select id="category" className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
    </div>
  );
}
