'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Library, User, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ExerciseCardProps {
  name: string;
  category: string;
  primaryMuscles: string[];
  isSystemExercise: boolean;
  description?: string | null;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExerciseCard({
  name, category, primaryMuscles, isSystemExercise, description, className, onEdit, onDelete,
}: ExerciseCardProps): ReactNode {
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0">
              {category.replace(/_/g, ' ')}
            </Badge>
            {!isSystemExercise && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
