import { Link, useRouterState } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/dashboard/site': 'Mi sitio',
  '/dashboard/customization': 'Personalización',
  '/dashboard/templates': 'Plantillas',
  '/dashboard/domain': 'Dominio y DNS',
  '/dashboard/subscription': 'Suscripción',
  '/dashboard/account': 'Cuenta',
};

export function DashboardHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === '/dashboard';
  const currentLabel = BREADCRUMB_MAP[pathname] ?? 'Inicio';

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isHome ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link to="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isHome && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
