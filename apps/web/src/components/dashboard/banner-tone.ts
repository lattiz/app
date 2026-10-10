import {
  CircleAlertIcon,
  InfoIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from 'lucide-react';

export type BannerTone = 'info' | 'warning' | 'destructive';

export const bannerToneStyles: Record<
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
