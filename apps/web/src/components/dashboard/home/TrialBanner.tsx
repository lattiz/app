import { Link } from '@tanstack/react-router';
import {
  CircleAlertIcon,
  InfoIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  trialHomeBanner,
  type TrialBannerTone,
} from '@/lib/trial-copy';
import { cn } from '@/lib/utils';
import type { PreviewState } from '@/types/dashboard.types';

const toneStyles: Record<
  TrialBannerTone,
  { variant: 'default' | 'destructive'; className: string; Icon: LucideIcon }
> = {
  destructive: { variant: 'destructive', className: '', Icon: CircleAlertIcon },
  warning: {
    variant: 'default',
    className:
      'border-yellow-500/30 bg-yellow-500/5 text-yellow-800 dark:text-yellow-300 *:data-[slot=alert-description]:text-yellow-700/90 dark:*:data-[slot=alert-description]:text-yellow-300/80',
    Icon: TriangleAlertIcon,
  },
  info: {
    variant: 'default',
    className: 'border-primary/30 bg-primary/5',
    Icon: InfoIcon,
  },
};

export function TrialBanner({
  previewState,
  previewExpiresAt,
}: {
  previewState: PreviewState | null;
  previewExpiresAt: string | null;
}) {
  const banner = trialHomeBanner(previewState, previewExpiresAt);
  if (!banner) return null;

  const tone = toneStyles[banner.tone];

  return (
    <Alert variant={tone.variant} className={cn('text-sm', tone.className)}>
      <tone.Icon />
      <AlertTitle>{banner.title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <p>{banner.description}</p>
        {banner.cta && (
          <Button
            size="sm"
            variant={banner.tone === 'destructive' ? 'destructive' : 'outline'}
            render={<Link to="/dashboard/subscription" />}
          >
            {banner.cta}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
