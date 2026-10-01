type IconComponent = React.ComponentType<{ className?: string }>;
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsEmptyStateProps {
  icon: IconComponent;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  iconClassName?: string;
}

export function AnalyticsEmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconClassName,
}: AnalyticsEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className={iconClassName ?? 'size-6 text-muted-foreground'} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <div className="mx-auto max-w-md text-sm text-muted-foreground">{description}</div>
          )}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
