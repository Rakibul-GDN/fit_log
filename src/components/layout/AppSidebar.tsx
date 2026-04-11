'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ListTodo,
  Dumbbell,
  BarChart3,
  Settings,
} from 'lucide-react';

// ── Icon map ───────────────────────────────────────────────────────
const ICONS: Record<string, ReactNode> = {
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  routines: <ListTodo className="h-4 w-4" />,
  workouts: <Dumbbell className="h-4 w-4" />,
  exercises: <Dumbbell className="h-4 w-4" />,
  progress: <BarChart3 className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
};

interface NavItem {
  label: string;
  href: string;
  iconKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', iconKey: 'dashboard' },
  { label: 'Routines', href: '/routines', iconKey: 'routines' },
  { label: 'Exercises', href: '/exercises', iconKey: 'exercises' },
  { label: 'Workout History', href: '/workouts', iconKey: 'workouts' },
  { label: 'Progress', href: '/progress', iconKey: 'progress' },
  { label: 'Settings', href: '/settings', iconKey: 'settings' },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
  variant?: 'sidebar' | 'mobile';
}

/** Modern shadcn/ui-style sidebar with flat menu items */
export function AppSidebar({ collapsed = false, onClose, variant = 'sidebar' }: AppSidebarProps): ReactNode {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarClasses = cn(
    'flex h-full flex-col bg-sidebar text-sidebar-foreground',
    variant === 'mobile' ? 'w-64' : collapsed ? 'w-[70px]' : 'w-64'
  );

  return (
    <div className={sidebarClasses}>
      {/* Logo */}
      <div className={cn(
        'flex h-14 items-center border-b border-sidebar-border px-4',
        collapsed && 'justify-center px-2'
      )}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          {!collapsed && <span className="text-lg font-bold">LogFit</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                  collapsed && 'justify-center px-0',
                  active
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                onClick={onClose}
              >
                {ICONS[item.iconKey]}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
