'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RoutineCardProps {
  id: string;
  name: string;
  description: string | null;
  exerciseCount: number;
  onDelete?: () => void;
  className?: string;
}

export function RoutineCard({ id, name, description, exerciseCount, onDelete, className }: RoutineCardProps) {
  return (
    <Card className={cn('transition hover:shadow-md', className)}>
      <CardContent className="flex items-start justify-between p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{name}</h3>
          {description && <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>}
          <Badge variant="secondary" className="mt-2">
            <Dumbbell className="mr-1 h-3 w-3" />
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} assigned
          </Badge>
        </div>
        <div className="ml-4 flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/routines/${id}`}><Eye className="mr-1.5 h-3.5 w-3.5" />View</Link>
          </Button>
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
