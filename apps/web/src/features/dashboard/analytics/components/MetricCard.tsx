import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDeltaPct } from '../lib/format';

interface MetricCardProps {
  label: string;
  value: string;
  /** Change vs. the previous 28 days; omitted or null hides the badge. */
  deltaPct?: number | null;
  hint?: string;
}

export function MetricCard({ label, value, deltaPct, hint }: MetricCardProps) {
  const hasDelta = deltaPct !== undefined && deltaPct !== null;
  const isUp = hasDelta && deltaPct >= 0;

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-2xl font-semibold tabular-nums">{value}</span>
        <div className="flex min-h-5 items-center gap-2 text-xs text-muted-foreground">
          {hasDelta && (
            <Badge
              variant="secondary"
              className={cn(
                isUp
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive',
              )}
            >
              {isUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {formatDeltaPct(deltaPct)}
            </Badge>
          )}
          {hint && <span className="truncate">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
