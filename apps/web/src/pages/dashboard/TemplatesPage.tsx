import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  tenantsControllerMeOptions,
  tenantsControllerMeQueryKey,
} from '@lattiz/api-client';
import { TemplateCard } from '@/components/dashboard/templates/TemplateCard';
import { TemplateChangeModal } from '@/components/dashboard/templates/TemplateChangeModal';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { NoSubscriptionGate } from '@/components/dashboard/home/NoSubscriptionGate';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { isConflictWithConfirmation, useChangeTemplate } from '@/hooks/use-change-template';
import { useSelectTemplate } from '@/hooks/use-select-template';
import { useTemplates } from '@/hooks/use-templates';
import { isTemplateLocked } from '@/features/templates/template-access';
import { templateAccessCopy } from '@/features/templates/template-access.copy';
import {
  ALL,
  filterOptions,
  filterTemplates,
  NO_FILTERS,
  type TemplateFilters,
} from '@/features/templates/template-identity';
import { UpgradeProDialog } from '@/features/templates/UpgradeProDialog';
import { reportSiteActionError } from '@/lib/upload-errors';
import { useDashboardStore } from '@/stores/dashboard.store';

export function TemplatesPage() {
  const dashboardState = useDashboardStore((s) => s.state);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const templates = useTemplates();
  const tenant = useQuery(tenantsControllerMeOptions());
  const canPublish = tenant.data?.canPublish !== false;

  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>(NO_FILTERS);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const siteLocked = isTemplateLocked(tenant.data);

  const tenantId = tenant.data?.tenantId ?? '';
  const currentTemplateId = tenant.data?.site?.templateId ?? null;

  const selectMutation = useSelectTemplate();
  const changeMutation = useChangeTemplate(tenantId);

  if (dashboardState === 'loading' || tenant.isLoading) return <DashboardSkeleton />;
  if (dashboardState === 'no-subscription') return <NoSubscriptionGate />;

  const isSelecting = selectMutation.isPending || changeMutation.isPending;
  const options = filterOptions(templates.data ?? []);
  const visible = filterTemplates(templates.data ?? [], filters);

  const goToCustomization = () => void navigate({ to: '/dashboard/customization' });

  const reportTemplateError = (err: unknown) => {
    reportSiteActionError(err, 'template', {
      onPlans: () => void navigate({ to: '/dashboard/subscription' }),
      onPreviewExpired: () => {
        void queryClient.invalidateQueries({
          queryKey: tenantsControllerMeQueryKey(),
        });
      },
    });
  };

  const applyChange = async (templateId: string, confirm: boolean) => {
    await changeMutation.mutateAsync({
      path: { tenantId },
      body: { templateId, confirm },
    });
  };

  const handleSelect = async (templateId: string) => {
    if (currentTemplateId === templateId) {
      if (!siteLocked) goToCustomization();
      return;
    }
    if (!canPublish) return;

    try {
      if (!currentTemplateId) {
        await selectMutation.mutateAsync({ body: { templateId } });
        goToCustomization();
        return;
      }

      await applyChange(templateId, false);
      await queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      goToCustomization();
    } catch (err) {
      if (isConflictWithConfirmation(err)) {
        setPendingTemplateId(templateId);
        return;
      }
      reportTemplateError(err);
    }
  };

  const handleConfirm = async () => {
    if (!pendingTemplateId || !canPublish) return;
    try {
      await applyChange(pendingTemplateId, true);
      setPendingTemplateId(null);
      await queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      goToCustomization();
    } catch (err) {
      setPendingTemplateId(null);
      reportTemplateError(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Plantillas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige el diseño base para tu sitio. Podrás personalizarlo
            completamente después.
          </p>
          {!canPublish && (
            <p className="mt-1 text-sm text-muted-foreground">
              {tenant.data?.previewState === 'trial_expired'
                ? 'Tu prueba gratuita terminó. Elige un plan para cambiar de plantilla.'
                : 'Elige un plan para cambiar de plantilla.'}
            </p>
          )}
        </div>
        {!canPublish && (
          <Button size="sm" render={<Link to="/dashboard/subscription" />}>
            Elige un plan
          </Button>
        )}
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
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={templateAccessCopy.filterLabel}
            className="flex flex-wrap gap-2"
          >
            {(['all', 'basic', 'pro'] as const).map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={filters.tier === filter ? 'default' : 'outline'}
                aria-pressed={filters.tier === filter}
                onClick={() => setFilters({ ...filters, tier: filter })}
              >
                {templateAccessCopy.filters[filter]}
              </Button>
            ))}
          </div>
          {Object.keys(options.giros).length > 1 && (
            <Select
              value={filters.giro}
              items={{ [ALL]: templateAccessCopy.giroFilter.all, ...options.giros }}
              onValueChange={(giro) => setFilters({ ...filters, giro: giro ?? ALL })}
            >
              <SelectTrigger
                size="sm"
                aria-label={templateAccessCopy.giroFilter.label}
                className="w-48"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{templateAccessCopy.giroFilter.all}</SelectItem>
                {Object.entries(options.giros).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {Object.keys(options.directions).length > 0 && (
            <Select
              value={filters.direction}
              items={{
                [ALL]: templateAccessCopy.directionFilter.all,
                ...options.directions,
              }}
              onValueChange={(direction) =>
                setFilters({ ...filters, direction: direction ?? ALL })
              }
            >
              <SelectTrigger
                size="sm"
                aria-label={templateAccessCopy.directionFilter.label}
                className="w-56"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>
                  {templateAccessCopy.directionFilter.all}
                </SelectItem>
                {Object.entries(options.directions).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {templates.data &&
        templates.data.length > 0 &&
        visible.length === 0 && (
          <div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
            {templateAccessCopy.emptyFilter}
          </div>
        )}

      {templates.data && templates.data.length > 0 && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-tour="template-gallery"
        >
          {visible.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isCurrentTemplate={currentTemplateId === template.id}
              isSelecting={isSelecting}
              changeLocked={!canPublish && currentTemplateId !== template.id}
              siteLocked={siteLocked}
              onSelect={(id) => void handleSelect(id)}
              onLockedFeature={setLockedFeature}
            />
          ))}
        </div>
      )}

      <UpgradeProDialog
        feature={lockedFeature}
        onClose={() => setLockedFeature(null)}
      />

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
