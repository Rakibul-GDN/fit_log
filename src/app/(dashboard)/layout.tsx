'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { usePageTitle } from '@/components/layout/PageTitleContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';

/** Map routes to titles and breadcrumbs */
const PAGE_META: Record<string, { title: string; breadcrumb: string[]; cta?: React.ReactNode }> = {
  '/': {
    title: 'Dashboard',
    breadcrumb: ['Dashboard', 'Overview'],
    cta: (
      <Link
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
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

/** Dashboard route group layout — modern shadcn/ui admin shell */
export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const { title: contextTitle, setTitle: setContextTitle } = usePageTitle();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine page meta from pathname
  const exactMatch = PAGE_META[pathname];
  const pageMeta = exactMatch ?? {
    title: contextTitle || (
      pathname.startsWith('/routines/') && pathname.split('/').length > 3
        ? 'Routine Detail'
        : pathname.startsWith('/workouts/') && pathname.split('/').length > 3
          ? 'Workout Detail'
          : pathname.split('/').pop() ?? 'Dashboard'
    ),
    breadcrumb: ['Dashboard', pathname.split('/')[1] ?? ''],
  };

  // Clear context title when pathname changes (for static routes)
  useEffect(() => {
    if (exactMatch) setContextTitle('');
  }, [pathname, exactMatch, setContextTitle]);

  const handleSignOut = async (): Promise<void> => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-y-0 left-0 z-50 md:hidden">
          <AppSidebar
            variant="mobile"
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden border-r bg-sidebar md:block">
        <AppSidebar
          collapsed={collapsed}
          variant="sidebar"
        />
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                      RK
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Page header with breadcrumbs */}
          <div className="border-b bg-card px-4 py-5 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <nav className="mb-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                  {pageMeta.breadcrumb.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-muted-foreground">/</span>}
                      {i === pageMeta.breadcrumb.length - 1 ? (
                        <span className="font-medium text-foreground">{c}</span>
                      ) : (
                        <Link className="hover:text-foreground" href={i === 0 ? '/' : '#'}>
                          {c}
                        </Link>
                      )}
                    </span>
                  ))}
                </nav>
                <h1 className="text-2xl font-bold">{pageMeta.title}</h1>
              </div>
              {pageMeta.cta}
            </div>
          </div>

          {/* Children */}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
