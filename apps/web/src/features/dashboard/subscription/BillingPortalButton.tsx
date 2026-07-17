import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useCreatePortalSession } from './useBilling';

interface Props {
  variant?: 'default' | 'outline' | 'secondary';
  children?: ReactNode;
}

export function BillingPortalButton({ variant = 'outline', children }: Props) {
  const portal = useCreatePortalSession();

  return (
    <Button
      variant={variant}
      disabled={portal.isPending}
      onClick={() => portal.mutate({})}
    >
      {children ?? 'Administrar suscripción'}
    </Button>
  );
}
