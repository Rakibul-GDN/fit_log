'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';

/** Sidebar item with icon */
export interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

/** Sidebar section */
export interface SidebarSection {
  title: string;
  icon?: ReactNode;
  items: SidebarItem[];
}

/** Sidebar component props */
export interface SidebarProps {
  sections: SidebarSection[];
}

/**
 * Sidebar component with collapsible sections and active route highlighting.
 */
export function Sidebar({ sections }: SidebarProps): ReactNode {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string): void => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className='flex h-full w-64 flex-col border-r border-default-200 bg-card'>
      <div className='flex-1 overflow-y-auto p-2'>
        {sections.map((section) => {
          const isCollapsed = collapsed[section.title] ?? false;
          return (
            <div className='mb-2' key={section.title}>
              <button
                className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-default-400 transition-colors hover:bg-default-100'
                onClick={() => toggleSection(section.title)}
                type='button'
              >
                {section.icon}
                <span className='flex-1 text-left'>{section.title}</span>
                <span className={`transition-transform ${isCollapsed ? 'rotate-[-90deg]' : 'rotate-0'}`}>
                  ▾
                </span>
              </button>
              {!isCollapsed && (
                <nav className='ml-1 flex flex-col gap-0.5'>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary/10 font-medium text-primary'
                            : 'text-default-600 hover:bg-default-100 hover:text-foreground'
                        }`}
                        href={item.href}
                        key={item.href}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
