import { Link } from '@tanstack/react-router';
import { bannerToneStyles } from '@/components/dashboard/banner-tone';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { trialHomeBanner } from '@/lib/trial-copy';
import { cn } from '@/lib/utils';
import type { PreviewState } from '@/types/dashboard.types';

export function TrialBanner({
  previewState,
  previewExpiresAt,
}: {
  previewState: PreviewState | null;
  previewExpiresAt: string | null;
}) {
  const banner = trialHomeBanner(previewState, previewExpiresAt);
  if (!banner) return null;

  const tone = bannerToneStyles[banner.tone];

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
