'use client';

import { Card } from '@/components/ui/Card';
import Link from 'next/link';

/**
 * Dashboard home page — displays welcome message and quick action cards.
 */
export default function DashboardPage(): React.ReactElement {
  const quickActions = [
    { label: 'My Routines', description: 'Create and manage workout routines', href: '/routines', icon: '📋' },
    { label: 'Exercise Library', description: 'Browse and add exercises', href: '/exercises', icon: '🏋️' },
    { label: 'Workout History', description: 'View past workout sessions', href: '/workouts', icon: '📊' },
    { label: 'Progress', description: 'Track your improvements', href: '/progress', icon: '📈' },
    { label: 'Settings', description: 'Account and preferences', href: '/settings', icon: '⚙️' },
  ];

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Welcome to LogFit</h1>
        <p className='mt-2 text-default-500'>
          Track your workouts, build routines, and see your progress.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {quickActions.map((action) => (
          <Link href={action.href} key={action.href}>
            <Card className='h-full cursor-pointer transition hover:shadow-md'>
              <div className='p-6'>
                <div className='mb-3 text-3xl'>{action.icon}</div>
                <h3 className='text-lg font-semibold'>{action.label}</h3>
                <p className='mt-1 text-sm text-default-500'>{action.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
