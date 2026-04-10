'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  ListTodo,
  Dumbbell,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
  TrendingDown,
  Minus,
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

interface NavItem { label: string; href: string; iconKey: string }
interface NavGroup { title: string; iconKey: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  { title: 'Dashboard', iconKey: 'dashboard', items: [{ label: 'Overview', href: '/', iconKey: 'dashboard' }] },
  { title: 'Planning', iconKey: 'routines', items: [
    { label: 'Routines', href: '/routines', iconKey: 'routines' },
    { label: 'Exercises', href: '/exercises', iconKey: 'exercises' },
  ]},
  { title: 'Tracking', iconKey: 'workouts', items: [
    { label: 'Workout History', href: '/workouts', iconKey: 'workouts' },
    { label: 'Progress', href: '/progress', iconKey: 'progress' },
  ]},
  { title: 'Account', iconKey: 'settings', items: [{ label: 'Settings', href: '/settings', iconKey: 'settings' }] },
];

// ── KPI Grid ───────────────────────────────────────────────────────
export interface KPIItem { label: string; value: string; trend: string; up: boolean }

export function KPIGrid({ items }: { items: KPIItem[] }): ReactNode {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((kpi) => (
        <div key={kpi.label} className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
          <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
          <div className="mt-1 flex items-center gap-1">
            {kpi.up ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : kpi.trend === '0' ? <Minus className="h-3 w-3 text-muted-foreground" /> : <TrendingDown className="h-3 w-3 text-muted-foreground" />}
            <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {kpi.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Data Table ───────────────────────────────────────────────────────
interface TableColumn { key: string; label: string }

export function DataTable({
  columns, data, renderCell, onRowClick,
}: {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  renderCell: (row: Record<string, unknown>, key: string) => ReactNode;
  onRowClick?: (row: Record<string, unknown>) => void;
}): ReactNode {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="border-b">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, i) => (
            <tr
              key={i}
              className={`transition-colors hover:bg-muted/50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {renderCell(row, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Chip ───────────────────────────────────────────────────────────
export function Chip({ children, color = 'default' }: { children: ReactNode; color?: 'success' | 'destructive' | 'warning' | 'default' }): ReactNode {
  const colors: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-amber-50 text-amber-700',
    default: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

// ── Admin Panel Layout ─────────────────────────────────────────────
interface AdminPanelProps {
  children: ReactNode;
  activePath: string;
  title: string;
  breadcrumb: string[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onMobileMenuOpen?: () => void;
  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  ctaButton?: ReactNode;
  onSignOut?: () => void;
}

export function AdminPanel({
  children, activePath, title, breadcrumb,
  collapsed = false, onToggleCollapse, onMobileMenuOpen,
  mobileMenuOpen = false, onCloseMobileMenu, ctaButton, onSignOut,
}: AdminPanelProps): ReactNode {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onCloseMobileMenu} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-zinc-900 text-zinc-100 transition-all duration-300 md:relative md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[68px]' : 'w-60'}`}
      >
        {/* Workspace */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-4'} py-4`}>
          <Dumbbell className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-bold tracking-wide">LogFit</span>}
        </div>
        <div className="mx-2 border-t border-zinc-700" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-2">
              {collapsed ? (
                <div className="mb-1 flex flex-col items-center gap-1">
                  {group.items.map((item) => {
                    const isActive = item.href === activePath;
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                          isActive ? 'bg-primary text-primary-foreground' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                        }`}
                        onClick={onCloseMobileMenu}
                        title={item.label}
                      >
                        {ICONS[item.iconKey]}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <>
                  <p className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {ICONS[group.iconKey]}
                    <span>{group.title}</span>
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = item.href === activePath;
                      return (
                        <Link key={item.href} href={item.href}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                            isActive
                              ? 'bg-primary font-medium text-primary-foreground'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                          }`}
                          onClick={onCloseMobileMenu}
                        >
                          {ICONS[item.iconKey]}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="mx-2 border-t border-zinc-700" />
        <button className="hidden items-center px-3 py-3 text-xs text-zinc-500 transition hover:text-zinc-300 md:flex"
          onClick={onToggleCollapse}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </button>
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded p-1.5 text-muted-foreground transition hover:bg-muted md:hidden"
              onClick={onMobileMenuOpen} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <button className="hidden rounded p-1.5 text-muted-foreground transition hover:bg-muted md:block"
              onClick={onToggleCollapse} aria-label="Toggle sidebar">
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <div className="hidden h-8 w-56 items-center gap-2 rounded-md bg-muted px-3 text-sm text-muted-foreground sm:flex">
              <Search className="h-4 w-4 shrink-0" />
              <span>Search…</span>
              <kbd className="ml-auto rounded bg-background px-1.5 text-xs">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded p-1.5 text-muted-foreground transition hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground cursor-pointer">
              RK
            </div>
            {onSignOut && (
              <Button size="sm" variant="outline" onClick={onSignOut}>
                <Dumbbell className="mr-1.5 h-3.5 w-3.5" />
                Sign Out
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="border-b bg-background px-4 py-5 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {breadcrumb.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-zinc-300">/</span>}
                      {i === breadcrumb.length - 1
                        ? <span className="font-medium text-foreground">{c}</span>
                        : <Link className="hover:text-foreground" href={i === 0 ? '/' : '#'}>{c}</Link>
                      }
                    </span>
                  ))}
                </nav>
                <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
              </div>
              {ctaButton}
            </div>
          </div>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
