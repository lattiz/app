import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { toast } from 'sonner';
import { TemplateCard } from '@/components/dashboard/templates/TemplateCard';
import { TemplateChangeModal } from '@/components/dashboard/templates/TemplateChangeModal';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { NoSubscriptionGate } from '@/components/dashboard/home/NoSubscriptionGate';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { isConflictWithConfirmation, useChangeTemplate } from '@/hooks/use-change-template';
import { useSelectTemplate } from '@/hooks/use-select-template';
import { useTemplates } from '@/hooks/use-templates';
import { useDashboardStore } from '@/stores/dashboard.store';

export function TemplatesPage() {
  const dashboardState = useDashboardStore((s) => s.state);
  const navigate = useNavigate();

  const templates = useTemplates();
  const tenant = useQuery(tenantsControllerMeOptions());

  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  const tenantId = tenant.data?.tenantId ?? '';
  const currentTemplateId = tenant.data?.site?.templateId ?? null;

  const selectMutation = useSelectTemplate();
  const changeMutation = useChangeTemplate(tenantId);

  if (dashboardState === 'loading' || tenant.isLoading) return <DashboardSkeleton />;
  if (dashboardState === 'no-subscription') return <NoSubscriptionGate />;

  const isSelecting = selectMutation.isPending || changeMutation.isPending;

  const goToCustomization = () => void navigate({ to: '/dashboard/customization' });

  const applyChange = async (templateId: string, confirm: boolean) => {
    await changeMutation.mutateAsync({
      path: { tenantId },
      body: { templateId, confirm },
    });
  };

  const handleSelect = async (templateId: string) => {
    try {
      if (!currentTemplateId) {
        await selectMutation.mutateAsync({ body: { templateId } });
        goToCustomization();
        return;
      }

      if (currentTemplateId === templateId) {
        goToCustomization();
        return;
      }

      await applyChange(templateId, false);
      goToCustomization();
    } catch (err) {
      if (isConflictWithConfirmation(err)) {
        setPendingTemplateId(templateId);
        return;
      }
      toast.error('No se pudo cambiar la plantilla. Intenta de nuevo.');
    }
  };

  const handleConfirm = async () => {
    if (!pendingTemplateId) return;
    try {
      await applyChange(pendingTemplateId, true);
      setPendingTemplateId(null);
      goToCustomization();
    } catch {
      setPendingTemplateId(null);
      toast.error('No se pudo cambiar la plantilla. Intenta de nuevo.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Plantillas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige el diseño base para tu sitio. Podrás personalizarlo
          completamente después.
        </p>
      </div>

      {templates.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 rounded-4xl" />
          ))}
        </div>
      )}

      {templates.isError && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No se pudieron cargar las plantillas.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void templates.refetch()}
          >
            Reintentar
          </Button>
        </div>
      )}

      {templates.data && templates.data.length === 0 && (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          No hay plantillas disponibles aún.
        </div>
      )}

      {templates.data && templates.data.length > 0 && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-tour="template-gallery"
        >
          {templates.data.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isCurrentTemplate={currentTemplateId === template.id}
              isSelecting={isSelecting}
              onSelect={(id) => void handleSelect(id)}
            />
          ))}
        </div>
      )}

      <TemplateChangeModal
        open={pendingTemplateId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTemplateId(null);
        }}
        onConfirm={() => void handleConfirm()}
        isConfirming={changeMutation.isPending}
      />
    </div>
  );
}
