'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminPanel } from '@/components/layout/AdminPanel';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

/** Map routes to titles and breadcrumbs */
const PAGE_META: Record<string, { title: string; breadcrumb: string[]; cta?: React.ReactNode }> = {
  '/': {
    title: 'Dashboard',
    breadcrumb: ['Dashboard', 'Overview'],
    cta: (
      <Link
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        href="/workouts/log"
      >
        + Log Workout
      </Link>
    ),
  },
  '/routines': {
    title: 'My Routines',
    breadcrumb: ['Dashboard', 'Planning', 'Routines'],
    cta: (
      <Link
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        href="/routines/create"
      >
        + New Routine
      </Link>
    ),
  },
  '/exercises': {
    title: 'Exercise Library',
    breadcrumb: ['Dashboard', 'Planning', 'Exercises'],
    cta: (
      <Link
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        href="/exercises/create"
      >
        + Add Exercise
      </Link>
    ),
  },
  '/workouts': {
    title: 'Workout History',
    breadcrumb: ['Dashboard', 'Tracking', 'Workouts'],
    cta: (
      <Link
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        href="/workouts/log"
      >
        + Log Workout
      </Link>
    ),
  },
  '/progress': {
    title: 'Progress',
    breadcrumb: ['Dashboard', 'Tracking', 'Progress'],
  },
  '/settings': {
    title: 'Settings',
    breadcrumb: ['Dashboard', 'Account', 'Settings'],
  },
};

/** Dashboard route group layout — wraps all authenticated pages with polished AdminPanel. */
export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine page meta from pathname
  const pageMeta = PAGE_META[pathname] ?? {
    title: pathname.split('/').pop() ?? 'Dashboard',
    breadcrumb: ['Dashboard', pathname.split('/')[1] ?? ''],
  };

  const handleSignOut = (): void => {
    void signOut({ callbackUrl: '/login' });
  };

  return (
    <AdminPanel
      activePath={pathname}
      title={pageMeta.title}
      breadcrumb={pageMeta.breadcrumb}
      collapsed={collapsed}
      ctaButton={pageMeta.cta}
      onToggleCollapse={() => setCollapsed((p) => !p)}
      onMobileMenuOpen={() => setMobileMenuOpen(true)}
      mobileMenuOpen={mobileMenuOpen}
      onCloseMobileMenu={() => setMobileMenuOpen(false)}
    >
      {children}
    </AdminPanel>
  );
}
