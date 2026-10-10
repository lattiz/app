import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { LockIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isTemplateLocked } from '@/features/templates/template-access';
import { templateAccessCopy as copy } from '@/features/templates/template-access.copy';

/**
 * Persistent while the site's template is above the plan (A2). The API is the
 * authority (`templateAccess.locked` from GET /tenants/me); this only shows it.
 */
export function TemplateLockBanner() {
  const tenant = useQuery(tenantsControllerMeOptions());
  if (!isTemplateLocked(tenant.data)) return null;
  const name = tenant.data?.templateAccess.current?.name ?? null;

  return (
    <Alert
      className="mb-4 border-amber-500/40 bg-amber-500/5"
      data-testid="template-lock-banner"
    >
      <LockIcon />
      <AlertTitle>{copy.banner.title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <p>{copy.banner.body(name)}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" render={<Link to="/dashboard/templates" />}>
            {copy.banner.chooseBasic}
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link to="/dashboard/subscription" />}
          >
            {copy.banner.reactivatePro}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
