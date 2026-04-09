'use client';

import { DashboardLayout as DashboardLayoutBase } from '@/components/layout/DashboardLayout';
import type { SidebarSection } from '@/components/layout/Sidebar';
import type { NavItem } from '@/components/layout/Header';

/** Icons */
const IconRoutines = <span>📋</span>;
const IconWorkouts = <span>🏃</span>;
const IconExercises = <span>🏋️</span>;
const IconProgress = <span>📈</span>;
const IconSettings = <span>⚙️</span>;
const IconPlanning = <span>📅</span>;
const IconTracking = <span>📊</span>;
const IconAccount = <span>👤</span>;

const headerItems: NavItem[] = [
  { label: 'Routines', href: '/routines', icon: IconRoutines },
  { label: 'Workouts', href: '/workouts', icon: IconWorkouts },
  { label: 'Exercises', href: '/exercises', icon: IconExercises },
  { label: 'Progress', href: '/progress', icon: IconProgress },
  { label: 'Settings', href: '/settings', icon: IconSettings },
];

const sidebarSections: SidebarSection[] = [
  {
    title: 'Workout Planning',
    icon: IconPlanning,
    items: [
      { label: 'My Routines', href: '/routines', icon: '📋' },
      { label: 'Exercise Library', href: '/exercises', icon: '🏋️' },
    ],
  },
  {
    title: 'Tracking',
    icon: IconTracking,
    items: [
      { label: 'Workout History', href: '/workouts', icon: '🏃' },
      { label: 'Progress', href: '/progress', icon: '📈' },
    ],
  },
  {
    title: 'Account',
    icon: IconAccount,
    items: [
      { label: 'Settings', href: '/settings', icon: '⚙️' },
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
    <DashboardLayoutBase
      headerItems={headerItems}
      showSidebar
      sidebarSections={sidebarSections}
    >
      {children}
    </DashboardLayoutBase>
  );
}
