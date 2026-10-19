import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_TONE_CLASS, type StatusBadge } from './labels';

export function StatusBadgeView({ badge }: { badge: StatusBadge }) {
  return (
    <Badge variant="outline" className={cn(STATUS_TONE_CLASS[badge.tone])}>
      {badge.label}
    </Badge>
  );
}
