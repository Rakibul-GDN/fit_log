'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface WorkoutHistoryCardProps {
  id: string;
  dayOfWeek: string;
  workoutDate: string;
  exerciseCount: number;
  routineName?: string | null;
  className?: string;
}

export function WorkoutHistoryCard({
  id, dayOfWeek, workoutDate, exerciseCount, routineName, className,
}: WorkoutHistoryCardProps) {
  const date = new Date(workoutDate);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link href={`/workouts/${id}`}>
      <Card className={cn('cursor-pointer transition hover:shadow-md', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{formatted}</h4>
              <p className="text-sm text-muted-foreground">
                {dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}
                {routineName && ` • ${routineName}`}
              </p>
            </div>
            <Badge variant="secondary">
              <Dumbbell className="mr-1 h-3 w-3" />
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
