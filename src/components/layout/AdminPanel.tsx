'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';

// ── Icon helpers ───────────────────────────────────────────────────
const ICONS = {
  dashboard: '📊', routines: '📋', workouts: '🏃', exercises: '🏋️',
  progress: '📈', settings: '⚙️', bell: '🔔', search: '🔍',
} as const;

interface NavItem { label: string; href: string; icon: string }
interface NavGroup { title: string; icon: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  { title: 'Dashboard', icon: ICONS.dashboard, items: [{ label: 'Overview', href: '/', icon: ICONS.dashboard }] },
  { title: 'Planning', icon: ICONS.routines, items: [
    { label: 'Routines', href: '/routines', icon: ICONS.routines },
    { label: 'Exercises', href: '/exercises', icon: ICONS.exercises },
  ]},
  { title: 'Tracking', icon: ICONS.workouts, items: [
    { label: 'Workout History', href: '/workouts', icon: ICONS.workouts },
    { label: 'Progress', href: '/progress', icon: ICONS.progress },
  ]},
  { title: 'Account', icon: ICONS.settings, items: [{ label: 'Settings', href: '/settings', icon: ICONS.settings }] },
];

// ── KPI Grid ───────────────────────────────────────────────────────
export interface KPIItem { label: string; value: string; trend: string; up: boolean }

export function KPIGrid({ items }: { items: KPIItem[] }): ReactNode {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((kpi) => (
        <div key={kpi.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{kpi.label}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{kpi.value}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-zinc-400'}`}>
              {kpi.up ? '↑' : '—'} {kpi.trend}
            </span>
            <span className="text-xs text-zinc-400">vs last week</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Data Table (plain HTML/Tailwind) ───────────────────────────────
interface TableColumn { key: string; label: string }

export function DataTable({
  columns,
  data,
  renderCell,
  onRowClick,
}: {
  columns: TableColumn[];
  data: Record<string, ReactNode>[];
  renderCell: (row: Record<string, ReactNode>, key: string) => ReactNode;
  onRowClick?: (row: Record<string, ReactNode>) => void;
}): ReactNode {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full">
        <thead className="bg-zinc-50">
          <tr className="border-b border-zinc-200">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((row, i) => (
            <tr
              key={i}
              className={`transition hover:bg-zinc-50 ${onRowClick ? 'cursor-pointer' : ''}`}
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
export function Chip({ children, color = 'default' }: { children: ReactNode; color?: 'success' | 'danger' | 'warning' | 'default' }): ReactNode {
  const colors: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
    default: 'bg-zinc-100 text-zinc-700',
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
  children, activePath = '/', title, breadcrumb,
  collapsed = false, onToggleCollapse, onMobileMenuOpen,
  mobileMenuOpen = false, onCloseMobileMenu, ctaButton, onSignOut,
}: AdminPanelProps): ReactNode {
  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onCloseMobileMenu} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-zinc-900 text-zinc-100 transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[68px]' : 'w-60'}`}
      >
        {/* Workspace */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-4`}>
          <span className="text-lg">🏋️</span>
          {!collapsed && <span className="ml-2 text-sm font-bold tracking-wide">LogFit</span>}
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
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition ${
                          isActive ? 'bg-primary text-white' : 'text-zinc-400 hover:bg-zinc-800'
                        }`}
                        onClick={onCloseMobileMenu}
                        title={item.label}
                      >
                        {item.icon}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <>
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {group.icon} {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = item.href === activePath;
                      return (
                        <Link key={item.href} href={item.href}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                            isActive
                              ? 'bg-primary font-medium text-white'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                          }`}
                          onClick={onCloseMobileMenu}
                        >
                          <span>{item.icon}</span>
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

        {/* Collapse */}
        <div className="mx-2 border-t border-zinc-700" />
        <button className="hidden px-3 py-3 text-xs text-zinc-500 hover:text-zinc-300 md:flex"
          onClick={onToggleCollapse}>
          {collapsed ? '→' : '← Collapse'}
        </button>
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded p-1 text-zinc-500 hover:bg-zinc-100 md:hidden"
              onClick={onMobileMenuOpen} aria-label="Open menu">☰</button>
            <button className="hidden rounded p-1 text-zinc-500 hover:bg-zinc-100 md:block"
              onClick={onToggleCollapse} aria-label="Toggle sidebar">{collapsed ? '→' : '←'}</button>
            <div className="hidden h-8 w-56 items-center rounded-md bg-zinc-100 px-3 text-sm text-zinc-400 sm:flex">
              🔍 Search…
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Notifications">
              🔔
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white cursor-pointer"
              title="User">
              RK
            </div>
            {onSignOut && (
              <button
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                onClick={onSignOut}
              >
                Sign Out
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-zinc-200 bg-white px-4 py-5 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <nav className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
                  {breadcrumb.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-zinc-300">/</span>}
                      {i === breadcrumb.length - 1
                        ? <span className="font-medium text-zinc-700">{c}</span>
                        : <Link className="hover:text-zinc-700" href={i === 0 ? '/' : '#'}>{c}</Link>
                      }
                    </span>
                  ))}
                </nav>
                <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">{title}</h1>
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

// ── Mock data exports ──────────────────────────────────────────────
export const MOCK_KPIs: KPIItem[] = [
  { label: 'Total Workouts', value: '47', trend: '+12%', up: true },
  { label: 'This Week', value: '5', trend: '+1', up: true },
  { label: 'Avg Volume', value: '10,800 kg', trend: '+5.2%', up: true },
  { label: 'Active Routines', value: '3', trend: '0', up: false },
];

export const MOCK_RECENT_WORKOUTS: Record<string, ReactNode>[] = [
  { id: '1', date: '2026-04-08', routine: 'Push Day', exercises: 6, volume: '12,450 kg', status: 'completed' },
  { id: '2', date: '2026-04-07', routine: 'Pull Day', exercises: 5, volume: '9,800 kg', status: 'completed' },
  { id: '3', date: '2026-04-06', routine: 'Leg Day', exercises: 7, volume: '15,200 kg', status: 'completed' },
  { id: '4', date: '2026-04-04', routine: 'Upper Body', exercises: 8, volume: '11,300 kg', status: 'completed' },
  { id: '5', date: '2026-04-02', routine: 'Push Day', exercises: 6, volume: '11,900 kg', status: 'completed' },
  { id: '6', date: '2026-04-01', routine: 'Pull Day', exercises: 5, volume: '9,200 kg', status: 'completed' },
];

export const MOCK_ROUTINES: Record<string, ReactNode>[] = [
  { id: '1', name: 'Push Day', exercises: 6, days: 'Mon, Thu', lastUsed: '2026-04-08' },
  { id: '2', name: 'Pull Day', exercises: 5, days: 'Tue, Fri', lastUsed: '2026-04-07' },
  { id: '3', name: 'Leg Day', exercises: 7, days: 'Wed, Sat', lastUsed: '2026-04-06' },
];
