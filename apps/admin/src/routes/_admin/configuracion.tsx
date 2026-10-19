import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { SettingsPage } from '@/features/settings/settings-page';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/configuracion')({
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const { me } = Route.useRouteContext();
  if (!me || !canAccess(me.role, '/configuracion')) {
    return <SectionPlaceholder title="Configuración" allowed={false} />;
  }
  return <SettingsPage canEdit={me.role === 'owner'} />;
}
