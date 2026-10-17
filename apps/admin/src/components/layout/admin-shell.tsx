import { Outlet } from '@tanstack/react-router';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { PageCrumbProvider } from '@/components/layout/page-crumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AdminShell() {
  return (
    <TooltipProvider>
      <PageCrumbProvider>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <AdminHeader />
            <main className="min-w-0 flex-1 p-4 sm:p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </PageCrumbProvider>
    </TooltipProvider>
  );
}
