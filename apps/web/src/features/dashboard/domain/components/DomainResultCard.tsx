import type { DomainSearchResultDto } from '@lattiz/api-client';
import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { domainCoverageCopy, offersProUpgrade } from '../lib/domain-copy';

interface Props {
  result: DomainSearchResultDto;
  loading: boolean;
  onSelect: (domain: string) => void;
}

export function DomainResultCard({ result, loading, onSelect }: Props) {
  const upgrade = result.available && offersProUpgrade(result);

  return (
    <Card className={result.available ? '' : 'opacity-60'}>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium">{result.domain}</span>
          {result.available ? (
            <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Disponible
              {result.coveredByPlan ? (
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-700 dark:text-green-400"
                >
                  {domainCoverageCopy.included}
                </Badge>
              ) : upgrade ? (
                <Badge>{domainCoverageCopy.availableWithPro}</Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {domainCoverageCopy.notIncluded}
                </Badge>
              )}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">No disponible</span>
          )}
        </div>
        {upgrade ? (
          <Button size="sm" render={<Link to="/dashboard/subscription" />}>
            {domainCoverageCopy.upgradeCta}
          </Button>
        ) : (
          result.available && (
            <Button
              size="sm"
              disabled={loading || !result.coveredByPlan}
              onClick={() => onSelect(result.domain)}
            >
              {loading && <Spinner />}
              Seleccionar
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
