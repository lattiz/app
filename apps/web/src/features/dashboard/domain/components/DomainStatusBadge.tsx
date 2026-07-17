import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'configuring' | 'propagating' | 'active' | 'error';

const STYLES: Record<Status, { text: string; className: string; pulse?: boolean }> = {
  pending: { text: 'Pendiente', className: 'bg-muted text-muted-foreground' },
  configuring: {
    text: 'Configurando DNS',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    pulse: true,
  },
  propagating: {
    text: 'DNS propagando…',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    pulse: true,
  },
  active: {
    text: 'Activo',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400',
  },
  error: { text: 'Error', className: 'bg-destructive/10 text-destructive' },
};

export function DomainStatusBadge({ status }: { status: Status }) {
  const style = STYLES[status];
  return (
    <Badge variant="secondary" className={cn(style.className, style.pulse && 'animate-pulse')}>
      {style.text}
    </Badge>
  );
}
