'use client';

import type { ReactNode } from 'react';

/** Day of week labels */
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

/** Exercise assignment data */
export interface ExerciseAssignment {
  id: string;
  dayOfWeek: string;
  order: number;
  exercise: { id: string; name: string; category: string };
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
}

/** Routine week view props */
export interface RoutineWeekViewProps {
  assignments: ExerciseAssignment[];
}

/**
 * RoutineWeekView — displays exercises organized by day with tabs.
 */
export function RoutineWeekView({ assignments }: RoutineWeekViewProps): ReactNode {
  return (
    <div className='w-full'>
      <div className='flex gap-1 overflow-x-auto border-b border-default-200 pb-2'>
        {DAYS.map((day) => {
          const dayAssignments = assignments.filter((a) => a.dayOfWeek === day);
          return (
            <div
              className='flex min-w-[140px] flex-col gap-2 rounded-t-lg border border-b-0 border-default-200 px-3 py-2'
              key={day}
            >
              <h4 className='text-sm font-semibold capitalize'>{day.toLowerCase()}</h4>
              {dayAssignments.length === 0 ? (
                <p className='text-xs text-default-400'>Rest day</p>
              ) : (
                <ul className='flex flex-col gap-1'>
                  {dayAssignments
                    .sort((a, b) => a.order - b.order)
                    .map((assignment) => (
                      <li className='rounded bg-default-100 px-2 py-1 text-xs' key={assignment.id}>
                        <p className='font-medium'>{assignment.exercise.name}</p>
                        <p className='text-default-500'>
                          {assignment.defaultSets} × {assignment.defaultReps} @ {assignment.defaultWeight}kg
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
