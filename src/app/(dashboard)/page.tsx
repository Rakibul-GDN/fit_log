'use client';

import { KPIGrid, DataTable, Chip, KPIItem, MOCK_KPIs, MOCK_RECENT_WORKOUTS, MOCK_ROUTINES } from '@/components/layout/AdminPanel';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/** Dashboard home — KPI stat cards + recent activity tables. */
export default function DashboardPage(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* KPI stat cards */}
      <KPIGrid items={MOCK_KPIs} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent workouts */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Recent Workouts</h2>
            <Link className="text-sm font-medium text-primary hover:underline" href="/workouts">
              View All →
            </Link>
          </div>
          <DataTable
            columns={[
              { key: 'date', label: 'DATE' },
              { key: 'routine', label: 'ROUTINE' },
              { key: 'exercises', label: 'EXERCISES' },
              { key: 'status', label: 'STATUS' },
            ]}
            data={MOCK_RECENT_WORKOUTS}
            renderCell={(row, key) => {
              if (key === 'date') return new Date(row.date as string).toLocaleDateString();
              if (key === 'routine') return <span className="font-medium">{row.routine as string}</span>;
              if (key === 'exercises') return String(row.exercises);
              if (key === 'status') return <Chip color="success">completed</Chip>;
              return null;
            }}
            onRowClick={(row) => router.push(`/workouts/${row.id}`)}
          />
        </div>

        {/* Active routines */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Active Routines</h2>
            <Link className="text-sm font-medium text-primary hover:underline" href="/routines">
              View All →
            </Link>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'ROUTINE' },
              { key: 'exercises', label: 'EX' },
              { key: 'days', label: 'DAYS' },
              { key: 'actions', label: '' },
            ]}
            data={MOCK_ROUTINES}
            renderCell={(row, key) => {
              if (key === 'name') return <span className="font-medium">{row.name as string}</span>;
              if (key === 'exercises') return <Chip>{String(row.exercises)}</Chip>;
              if (key === 'days') return <span className="text-zinc-500">{row.days as string}</span>;
              if (key === 'actions') return (
                <Link
                  className="text-sm font-medium text-primary hover:underline"
                  href={`/routines/${row.id}/quick-log`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Quick Log →
                </Link>
              );
              return null;
            }}
            onRowClick={(row) => router.push(`/routines/${row.id}`)}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Log Workout', href: '/workouts/log', icon: '🏃' },
            { label: 'New Routine', href: '/routines/create', icon: '📋' },
            { label: 'Browse Exercises', href: '/exercises', icon: '🏋️' },
            { label: 'View Progress', href: '/progress', icon: '📈' },
          ].map((action) => (
            <Link
              key={action.href}
              className="flex flex-col items-center gap-1 rounded-lg border border-zinc-200 p-4 text-center transition hover:border-primary hover:bg-primary/5"
              href={action.href}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-zinc-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
