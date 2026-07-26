import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';

/**
 * Route group for everything behind the dashboard chrome. `/testimonials` sits
 * outside it deliberately — that page is public and must not show the sidebar.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div id="main-content">{children}</div>
    </AppShell>
  );
}
