'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dumbbell, Pencil, Trash2, MoreVertical, Zap } from 'lucide-react';
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
          <Link href={`/routines/${id}`} className="block">
            <h3 className="truncate text-lg font-semibold text-foreground hover:underline">{name}</h3>
          </Link>
          {description && <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>}
          <Badge variant="secondary" className="mt-2">
            <Dumbbell className="mr-1 h-3 w-3" />
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} assigned
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2 h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/routines/${id}/quick-log`} className="cursor-pointer">
                <Zap className="mr-2 h-4 w-4" />
                Quick Log
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/routines/${id}`} className="cursor-pointer">
                <Dumbbell className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/routines/${id}/edit`} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onSelect={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
