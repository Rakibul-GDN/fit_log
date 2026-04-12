'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface WorkoutHistoryCardProps {
  id: string;
  dayOfWeek: string;
  workoutDate: string;
  exerciseCount: number;
  routineName?: string | null;
  onDelete?: () => void;
  className?: string;
}

export function WorkoutHistoryCard({
  id, dayOfWeek, workoutDate, exerciseCount, routineName, onDelete, className,
}: WorkoutHistoryCardProps) {
  const date = new Date(workoutDate);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Card className={cn('transition hover:shadow-md', className)}>
      <CardContent className="flex items-center justify-between p-4">
        <Link href={`/workouts/${id}`} className="min-w-0 flex-1">
          <h4 className="font-semibold hover:underline">{formatted}</h4>
          <p className="text-sm text-muted-foreground">
            {dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}
            {routineName && ` • ${routineName}`}
          </p>
        </Link>
        <div className="ml-2 flex items-center gap-2">
          <Badge variant="secondary">
            <Dumbbell className="mr-1 h-3 w-3" />
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
          </Badge>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
