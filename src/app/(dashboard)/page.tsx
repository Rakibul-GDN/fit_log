'use client';

import { KPIGrid, DataTable, Chip, type KPIItem } from '@/components/layout/AdminPanel';
import { useWorkouts } from '@/hooks/api/useWorkouts';
import { useRoutines } from '@/hooks/api/useRoutines';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import { Dumbbell, ListTodo, BarChart3, Plus } from 'lucide-react';

/** Dashboard home — KPI stat cards + recent activity tables from real data. */
export default function DashboardPage(): React.ReactElement {
  const router = useRouter();
  const { data: workoutsData, isLoading: workoutsLoading } = useWorkouts(1, 10);
  const { data: routinesData, isLoading: routinesLoading } = useRoutines(1, 10);

  const workouts = workoutsData?.data ?? [];
  const routines = routinesData?.data ?? [];

  // Compute KPIs from real data
  const kpis = useMemo<KPIItem[]>(() => {
    const totalWorkouts = workoutsData?.pagination?.total ?? 0;
    const thisWeek = workouts.filter((w) => {
      const d = new Date(w.workoutDate);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return d >= startOfWeek;
    }).length;
    const avgVolume = totalWorkouts > 0
      ? Math.round(workouts.reduce((sum, w) => {
          const entries = (w as { logEntries?: Array<{ weight: number; repsPerSet: number[]; setsCompleted: number }> }).logEntries ?? [];
          return sum + entries.reduce((e, entry) => e + entry.weight * entry.repsPerSet.reduce((r, v) => r + v, 0), 0);
        }, 0) / Math.max(workouts.length, 1))
      : 0;
    const activeRoutines = routines.length;

    return [
      { label: 'Total Workouts', value: String(totalWorkouts), trend: totalWorkouts > 0 ? '—' : '0', up: true },
      { label: 'This Week', value: String(thisWeek), trend: thisWeek > 0 ? '—' : '0', up: thisWeek > 0 },
      { label: 'Avg Volume', value: `${(avgVolume / 1000).toFixed(1)}k kg`, trend: '—', up: false },
      { label: 'Active Routines', value: String(activeRoutines), trend: '—', up: false },
    ];
  }, [workouts, routines, workoutsData?.pagination?.total]);

  // Map real workouts to table rows
  const workoutRows = workouts.map((w) => {
    const entries = (w as { logEntries?: Array<{ weight: number; repsPerSet: number[]; setsCompleted: number }> }).logEntries ?? [];
    return {
      id: w.id,
      date: w.workoutDate,
      routine: (w as { routine?: { name?: string } }).routine?.name ?? 'Free workout',
      exercises: entries.length,
      status: 'completed',
    };
  });

  // Map real routines to table rows
  const routineRows = routines.map((r) => {
    const assignments = (r as { exerciseAssignments?: Array<{ dayOfWeek: string }> }).exerciseAssignments ?? [];
    const days = [...new Set(assignments.map((a: { dayOfWeek: string }) => a.dayOfWeek))];
    return {
      id: r.id,
      name: r.name,
      exercises: assignments.length,
      days: days.map((d: string) => d.slice(0, 3)).join(', '),
    };
  });

  if (workoutsLoading && routinesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg border bg-muted" />
          <div className="h-64 animate-pulse rounded-lg border bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI stat cards */}
      <KPIGrid items={kpis} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent workouts */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Workouts</h2>
            <Link className="text-sm font-medium text-primary hover:underline" href="/workouts">
              View All →
            </Link>
          </div>
          {workouts.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-lg text-muted-foreground">No workouts yet</p>
              <Link className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/workouts/log">
                Log your first workout
              </Link>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'date', label: 'DATE' },
                { key: 'routine', label: 'ROUTINE' },
                { key: 'exercises', label: 'EXERCISES' },
                { key: 'status', label: 'STATUS' },
              ]}
              data={workoutRows}
              renderCell={(row, key) => {
                if (key === 'date') return new Date(row.date as string).toLocaleDateString();
                if (key === 'routine') return <span className="font-medium">{String(row.routine)}</span>;
                if (key === 'exercises') return String(row.exercises);
                if (key === 'status') return <Chip color="success">completed</Chip>;
                return null;
              }}
              onRowClick={(row) => router.push(`/workouts/${String(row.id)}`)}
            />
          )}
        </div>

        {/* Active routines */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Routines</h2>
            <Link className="text-sm font-medium text-primary hover:underline" href="/routines">
              View All →
            </Link>
          </div>
          {routines.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-lg text-muted-foreground">No routines yet</p>
              <Link className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/routines/create">
                Create your first routine
              </Link>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'name', label: 'ROUTINE' },
                { key: 'exercises', label: 'EX' },
                { key: 'days', label: 'DAYS' },
                { key: 'actions', label: '' },
              ]}
              data={routineRows}
              renderCell={(row, key) => {
                if (key === 'name') return <span className="font-medium">{String(row.name)}</span>;
                if (key === 'exercises') return <Chip>{String(row.exercises)}</Chip>;
                if (key === 'days') return <span className="text-muted-foreground">{String(row.days)}</span>;
                if (key === 'actions') return (
                  <Link
                    className="text-sm font-medium text-primary hover:underline"
                    href={`/routines/${String(row.id)}/quick-log`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Quick Log →
                  </Link>
                );
                return null;
              }}
              onRowClick={(row) => router.push(`/routines/${String(row.id)}`)}
            />
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Log Workout', href: '/workouts/log', icon: <Dumbbell className="h-6 w-6" /> },
            { label: 'New Routine', href: '/routines/create', icon: <ListTodo className="h-6 w-6" /> },
            { label: 'Browse Exercises', href: '/exercises', icon: <Plus className="h-6 w-6" /> },
            { label: 'View Progress', href: '/progress', icon: <BarChart3 className="h-6 w-6" /> },
          ].map((action) => (
            <Link
              key={action.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
              href={action.href}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
