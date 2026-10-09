import { Link } from '@tanstack/react-router';
import { LockKeyholeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { upgradeGateCopy } from '@/lib/trial-copy';
import { cn } from '@/lib/utils';

const COPY = {
  domain: upgradeGateCopy.domain,
  address: upgradeGateCopy.address,
  analytics: upgradeGateCopy.analytics,
} as const;

export function UpgradeGate({
  reason,
  className,
}: {
  reason: keyof typeof COPY;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <LockKeyholeIcon className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{upgradeGateCopy.title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{COPY[reason]}</p>
      </div>
      <Button render={<Link to="/dashboard/subscription" />}>
        {upgradeGateCopy.cta}
      </Button>
    </div>
  );
}
