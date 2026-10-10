import { AppSidebar } from '@/components/layout/AppSidebar';
import { TemplateLockBanner } from '@/components/dashboard/templates/TemplateLockBanner';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { OnboardingTour } from '@/features/onboarding/OnboardingTour';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6">
            <TemplateLockBanner />
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <OnboardingTour />
    </TooltipProvider>
  );
}
