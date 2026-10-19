import {
  adminMetricsControllerTemplatesOptions,
  type MetricsTemplateRankDto,
} from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount, formatPercent } from '@/lib/format';
import { QueryAlert } from '@/components/query-alert';

const SHORT_LIST = 5;

const TIER_LABEL: Record<MetricsTemplateRankDto['tier'], string> = {
  basic: 'Básico',
  pro: 'Pro',
};

export function TemplateLists() {
  const query = useQuery(adminMetricsControllerTemplatesOptions());

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Plantillas</CardTitle>
        <CardDescription>
          Las que más eligen los clientes y las que más terminan pagando.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? <Skeleton className="h-48" /> : null}
        {query.isError ? (
          <QueryAlert
            error={query.error}
            pending={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data && !query.isError ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <RankList
              title="Más elegidas"
              empty="Nadie ha elegido una plantilla todavía."
              items={query.data.byAdoption.slice(0, SHORT_LIST)}
              emphasize="adoption"
            />
            <RankList
              title="Las que más convierten"
              empty="Hace falta que más clientes usen una plantilla para medir esto."
              items={query.data.byConversion.slice(0, SHORT_LIST)}
              emphasize="conversion"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RankList({
  title,
  empty,
  items,
  emphasize,
}: {
  title: string;
  empty: string;
  items: MetricsTemplateRankDto[];
  emphasize: 'adoption' | 'conversion';
}) {
  return (
    <section className="min-w-0">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="flex flex-col">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {TIER_LABEL[item.tier]}
                </p>
              </div>
              <p className="shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                {emphasize === 'conversion' && item.conversionRate != null
                  ? `${formatPercent(item.conversionRate)} pagan`
                  : `${formatCount(item.tenantsUsing)} clientes`}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
