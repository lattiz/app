import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { LayoutIcon } from 'lucide-react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { EditorGatewayCard } from '@/components/dashboard/customization/EditorGatewayCard';
import { FlowChecklist } from '@/components/dashboard/customization/FlowChecklist';
import { TemplateSection } from '@/components/dashboard/customization/TemplateSection';
import { SiteImagesSection } from '@/components/dashboard/customization/SiteImagesSection';
import { NoSubscriptionGate } from '@/components/dashboard/home/NoSubscriptionGate';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboard.store';

export function CustomizationPage() {
  const state = useDashboardStore((s) => s.state);
  const site = useDashboardStore((s) => s.site);
  const subscription = useDashboardStore((s) => s.subscription);
  const tenant = useQuery(tenantsControllerMeOptions());

  if (state === 'loading' || tenant.isLoading) return <DashboardSkeleton />;
  if (state === 'no-subscription') return <NoSubscriptionGate />;

  if (tenant.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No se pudo cargar la información del sitio. Recarga la página.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (state === 'no-template') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <LayoutIcon className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Elige tu plantilla base</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Selecciona el diseño que mejor represente tu negocio. Podrás
            personalizarlo completamente después.
          </p>
        </div>
        <Button size="sm" render={<Link to="/dashboard/templates" />}>
          Elegir plantilla
        </Button>
        <p className="text-xs text-muted-foreground">
          Necesitas una plantilla antes de abrir el editor.
        </p>
      </div>
    );
  }

  if (!site || !subscription || !tenant.data) return null;

  return (
    <div className="flex flex-col gap-4">
      <EditorGatewayCard tenantId={tenant.data.tenantId} site={site} />
      <SiteImagesSection
        tenantId={tenant.data.tenantId}
        branding={tenant.data.branding}
      />
      <TemplateSection site={site} />
      <FlowChecklist site={site} subscription={subscription} />
    </div>
  );
}
