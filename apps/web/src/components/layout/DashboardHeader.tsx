import { Link, useRouterState } from '@tanstack/react-router';
import { ExternalLinkIcon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useDashboardStore } from '@/stores/dashboard.store';

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

  const state = useDashboardStore((s) => s.state);
  const site = useDashboardStore((s) => s.site);

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

      {isHome && (
        <div className="ml-auto flex items-center gap-2">
          {state === 'active' && site?.isOnline && site.domain && (
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={`https://${site.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Ver sitio <ExternalLinkIcon />
            </Button>
          )}
          {state === 'no-subscription' && (
            <Button
              variant="destructive"
              size="sm"
              render={<Link to="/dashboard/subscription" />}
            >
              Activar plan
            </Button>
          )}
          {state === 'no-template' && (
            <Button size="sm" render={<Link to="/dashboard/templates" />}>
              Elegir plantilla
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
