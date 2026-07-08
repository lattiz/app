import { Link } from '@tanstack/react-router';
import {
  CircleAlertIcon,
  InfoIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

interface HomeBannersProps {
  state: DashboardState;
  site: SiteStatus | null;
  subscription: SubscriptionStatus | null;
}

type BannerTone = 'destructive' | 'warning' | 'info';

// Only routes a banner CTA can point to — keeps TanStack Link type-safe.
type BannerLinkTo = '/dashboard/subscription' | '/dashboard/domain';

interface Banner {
  tone: BannerTone;
  title: string;
  description: string;
  link?: { to: BannerLinkTo; label: string };
}

const toneStyles: Record<
  BannerTone,
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

// Highest-priority condition wins — at most one banner is shown.
function resolveBanner(
  state: DashboardState,
  site: SiteStatus | null,
  subscription: SubscriptionStatus | null,
): Banner | null {
  if (subscription?.status === 'past_due') {
    return {
      tone: 'destructive',
      title: 'Problema con tu pago.',
      description:
        'Actualiza tu método de pago para mantener tu sitio en línea.',
      link: { to: '/dashboard/subscription', label: 'Actualizar →' },
    };
  }
  if (site?.dnsError) {
    return {
      tone: 'destructive',
      title: 'Error en la configuración DNS.',
      description:
        'Tu dominio no apunta correctamente a Lattiz. El sitio puede no ser accesible desde tu dominio propio.',
      link: { to: '/dashboard/domain', label: 'Ir a Dominio y DNS →' },
    };
  }
  if (site?.deployInProgress) {
    return {
      tone: 'warning',
      title: 'Publicando cambios…',
      description:
        'Tu sitio se está actualizando. La versión anterior sigue en línea.',
    };
  }
  if (site?.dnsPropagating) {
    return {
      tone: 'warning',
      title: 'Propagando DNS.',
      description:
        'Los cambios de DNS pueden tardar hasta 48 horas en aplicarse globalmente.',
    };
  }
  if (state === 'no-template') {
    return {
      tone: 'info',
      title: 'Elige una plantilla para comenzar.',
      description: 'Tu sitio estará listo para publicar en minutos.',
    };
  }
  return null;
}

export function HomeBanners({ state, site, subscription }: HomeBannersProps) {
  const banner = resolveBanner(state, site, subscription);
  if (!banner) return null;

  const tone = toneStyles[banner.tone];

  return (
    <Alert variant={tone.variant} className={cn('text-sm', tone.className)}>
      <tone.Icon />
      <AlertTitle>{banner.title}</AlertTitle>
      <AlertDescription>
        {banner.description}
        {banner.link && (
          <>
            {' '}
            <Link
              to={banner.link.to}
              className="font-medium underline underline-offset-4"
            >
              {banner.link.label}
            </Link>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
