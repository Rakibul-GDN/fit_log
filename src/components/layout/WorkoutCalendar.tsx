import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

interface WorkoutCalendarProps {
  workouts: Array<{
    id: string;
    workoutDate: string;
    dayOfWeek: string;
    exerciseCount: number;
  }>;
  onSelectWorkout: (id: string) => void;
  onViewAll?: (date: Date, workoutIds: string[]) => void;
}

export function WorkoutCalendar({ workouts, onSelectWorkout, onViewAll }: WorkoutCalendarProps) {
  // Map workouts to calendar events
  const events: Event[] = workouts.map((w) => ({
    id: w.id,
    title: `${w.exerciseCount} exercise${w.exerciseCount !== 1 ? 's' : ''}`,
    start: new Date(w.workoutDate),
    end: new Date(w.workoutDate),
    allDay: true,
    resource: w,
  }));

  // Group workouts by date string for 'View All Logs'
  const dateToWorkouts: Record<string, string[]> = {};
  workouts.forEach(w => {
    const key = new Date(w.workoutDate).toDateString();
    if (!dateToWorkouts[key]) dateToWorkouts[key] = [];
    dateToWorkouts[key].push(w.id);
  });

  return (
    <div className="rounded-lg bg-card p-4 shadow-lg w-full h-[calc(100vh-120px)] min-h-[600px] flex flex-col justify-center">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', width: '100%' }}
        popup
        views={['month']}
        onSelectEvent={(event) => onSelectWorkout(event.id as string)}
        components={{
          dateCellWrapper: (props) => {
            const dateKey = props.value.toDateString();
            const ids = dateToWorkouts[dateKey];
            if (!ids) return <div {...props} />;
            return (
              <div {...props} className={cn(props.className, 'relative')}> 
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-1 right-1 z-10 text-xs px-2 py-1"
                  onClick={e => {
                    e.stopPropagation();
                    if (onViewAll) onViewAll(props.value, ids);
                  }}
                >
                  View All Logs
                </Button>
                {props.children}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
