import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { signOutAdmin } from '@/lib/sign-out';

export function SignOutButton({
  variant = 'outline',
  className,
}: {
  variant?: 'outline' | 'ghost';
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signOutAdmin().catch(() => setPending(false));
      }}
    >
      {pending && <Spinner data-icon="inline-start" />}
      Cerrar sesión
    </Button>
  );
}
