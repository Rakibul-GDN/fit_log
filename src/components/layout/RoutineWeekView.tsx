'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

interface ExerciseAssignment {
  id: string;
  exerciseId: string;
  exerciseName: string;
  dayOfWeek: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  order: number;
}

interface RoutineWeekViewProps {
  assignments?: ExerciseAssignment[];
  className?: string;
}

export function RoutineWeekView({ assignments = [], className }: RoutineWeekViewProps) {
  const groupedByDay = new Map<string, ExerciseAssignment[]>();
  for (const a of assignments) {
    const existing = groupedByDay.get(a.dayOfWeek) ?? [];
    existing.push(a);
    existing.sort((a, b) => a.order - b.order);
    groupedByDay.set(a.dayOfWeek, existing);
  }

  return (
    <div className={cn('space-y-4', className)}>
      {DAYS.map((day) => {
        const dayAssignments = groupedByDay.get(day) ?? [];
        return (
          <Card key={day}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayAssignments.length > 0 ? (
                <ul className="space-y-2">
                  {dayAssignments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="font-medium">{a.exerciseName}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{a.defaultSets} sets</Badge>
                        <Badge variant="secondary">{a.defaultReps} reps</Badge>
                        <Badge variant="outline">{a.defaultWeight} kg</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Rest day</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
