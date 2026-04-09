import type { ReactNode } from 'react';
import { Container } from './Container';
import { Header } from './Header';
import type { NavItem } from './Header';
import type { SidebarSection } from './Sidebar';
import { Sidebar } from './Sidebar';

/**
 * Dashboard layout props.
 */
export interface DashboardLayoutProps {
  children: ReactNode;
  headerItems?: NavItem[];
  sidebarSections?: SidebarSection[];
  showSidebar?: boolean;
}

/**
 * Dashboard layout combining Header, Sidebar, and main content area.
 */
export function DashboardLayout({
  children,
  headerItems,
  sidebarSections,
  showSidebar = true,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header navItems={headerItems} />
      <div className="flex flex-1">
        {showSidebar && sidebarSections && (
          <Sidebar sections={sidebarSections} />
        )}
        <main className="flex-1">
          <Container>{children}</Container>
        </main>
      </div>
    </div>
  );
}
