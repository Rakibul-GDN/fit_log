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
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

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

interface NavGroup {
  title: string;
  iconKey: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    iconKey: 'dashboard',
    items: [{ label: 'Dashboard', href: '/', iconKey: 'dashboard' }],
    defaultOpen: true,
  },
  {
    title: 'Planning',
    iconKey: 'routines',
    items: [
      { label: 'Routines', href: '/routines', iconKey: 'routines' },
      { label: 'Exercises', href: '/exercises', iconKey: 'exercises' },
    ],
    defaultOpen: true,
  },
  {
    title: 'Tracking',
    iconKey: 'workouts',
    items: [
      { label: 'Workout History', href: '/workouts', iconKey: 'workouts' },
      { label: 'Progress', href: '/progress', iconKey: 'progress' },
    ],
    defaultOpen: true,
  },
  {
    title: 'Account',
    iconKey: 'settings',
    items: [{ label: 'Settings', href: '/settings', iconKey: 'settings' }],
    defaultOpen: false,
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
  variant?: 'sidebar' | 'mobile';
}

/** Modern shadcn/ui-style sidebar with collapsible sections */
export function AppSidebar({ collapsed = false, onClose, variant = 'sidebar' }: AppSidebarProps): ReactNode {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      NAV_GROUPS.forEach((group) => {
        initial[group.title] = group.defaultOpen ?? false;
      });
      return initial;
    }
  );

  const toggleGroup = (title: string): void => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

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
        <div className="space-y-2">
          {NAV_GROUPS.map((group) => {
            const isGroupActive = group.items.some((item) => isActive(item.href));
            const isExpanded = expandedGroups[group.title] ?? false;

            if (collapsed) {
              // Collapsed state: show icons only
              return (
                <div key={group.title} className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                        onClick={onClose}
                        title={item.label}
                      >
                        {ICONS[item.iconKey]}
                      </Link>
                    );
                  })}
                </div>
              );
            }

            // Expanded state: show collapsible groups
            return (
              <div key={group.title} className="space-y-1">
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                    isGroupActive
                      ? 'text-sidebar-foreground'
                      : 'text-sidebar-muted hover:text-sidebar-foreground'
                  )}
                  onClick={() => toggleGroup(group.title)}
                >
                  {ICONS[group.iconKey]}
                  <span className="flex-1 text-left uppercase tracking-wider">{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-2 space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                            active
                              ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                              : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                          onClick={onClose}
                        >
                          {ICONS[item.iconKey]}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
