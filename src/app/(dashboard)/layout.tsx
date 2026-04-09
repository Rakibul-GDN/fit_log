'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { SidebarSection } from '@/components/layout/Sidebar';
import type { NavItem } from '@/components/layout/Header';

const headerItems: NavItem[] = [
  { label: 'Routines', href: '/routines' },
  { label: 'Workouts', href: '/workouts' },
  { label: 'Exercises', href: '/exercises' },
  { label: 'Progress', href: '/progress' },
  { label: 'Settings', href: '/settings' },
];

const sidebarSections: SidebarSection[] = [
  {
    title: 'Workout Planning',
    items: [
      { label: 'My Routines', href: '/routines' },
      { label: 'Exercise Library', href: '/exercises' },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: 'Workout History', href: '/workouts' },
      { label: 'Progress', href: '/progress' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', href: '/settings' },
    ],
  },
];

/** Dashboard route group layout — authenticated pages with sidebar navigation. */
export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <DashboardLayout
      headerItems={headerItems}
      showSidebar
      sidebarSections={sidebarSections}
    >
      {children}
    </DashboardLayout>
  );
}
