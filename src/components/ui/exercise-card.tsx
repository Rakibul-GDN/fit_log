'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Library, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  name: string;
  category: string;
  primaryMuscles: string[];
  isSystemExercise: boolean;
  description?: string | null;
  className?: string;
}

export function ExerciseCard({
  name, category, primaryMuscles, isSystemExercise, description, className,
}: ExerciseCardProps) {
  return (
    <Card className={cn('transition hover:shadow-md', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-semibold">{name}</h4>
              {isSystemExercise
                ? <Badge variant="secondary" className="shrink-0"><Library className="mr-1 h-3 w-3" />Library</Badge>
                : <Badge variant="outline" className="shrink-0"><User className="mr-1 h-3 w-3" />Custom</Badge>
              }
            </div>
            {description && <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          <Badge variant="outline" className="shrink-0">
            {category.replace(/_/g, ' ')}
          </Badge>
        </div>
        {primaryMuscles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {primaryMuscles.map((muscle) => (
              <Badge key={muscle} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
