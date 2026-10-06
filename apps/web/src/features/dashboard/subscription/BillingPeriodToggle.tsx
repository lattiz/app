import { cn } from '@/lib/utils';
import type { BillingPeriod } from './plans';

interface Props {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  /** Shown on the annual option only when every plan saves the same (e.g. "Ahorra 2 meses"). */
  annualBadge?: string | null;
}

const OPTIONS: { id: BillingPeriod; label: string }[] = [
  { id: 'monthly', label: 'Mensual' },
  { id: 'annual', label: 'Anual' },
];

export function BillingPeriodToggle({ value, onChange, annualBadge }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1 text-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-colors',
            value === opt.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
          {opt.id === 'annual' && annualBadge && (
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
              {annualBadge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
