import { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { DomainResultCard } from '../components/DomainResultCard';
import { useDomainQuote } from '../hooks/useDomainQuote';
import { searchErrorMessage } from '../lib/domain-errors';
import { sortDomainSearchResults } from '../lib/sort-domain-search-results';
import { useDomainSearch } from '../hooks/useDomainSearch';
import { DomainSearchSchema } from '../schemas/domain.schemas';
import { useDomainWizardStore } from '../store/domain-wizard.store';

export function SearchStep() {
  const searchQuery = useDomainWizardStore((s) => s.searchQuery);
  const selectedDomain = useDomainWizardStore((s) => s.selectedDomain);
  const setSearchQuery = useDomainWizardStore((s) => s.setSearchQuery);
  const selectDomain = useDomainWizardStore((s) => s.selectDomain);

  const [input, setInput] = useState(searchQuery);
  const [validationError, setValidationError] = useState<string | null>(null);

  const search = useDomainSearch(searchQuery);
  const quote = useDomainQuote();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = DomainSearchSchema.safeParse({ query: input.trim().toLowerCase() });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Búsqueda inválida');
      return;
    }
    setValidationError(null);
    if (parsed.data.query === searchQuery) {
      void search.refetch();
      return;
    }
    setSearchQuery(parsed.data.query);
  };

  const onSelect = (domain: string) => {
    selectDomain(domain);
    quote.mutate({ body: { domain } });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold">
          Encuentra el dominio para tu negocio
        </h1>
        <p className="text-sm text-muted-foreground">
          Busca el nombre de tu marca y elige la terminación que prefieras. La
          renovación anual está incluida en tu plan.
        </p>
      </div>

      <form onSubmit={submit} className="flex max-w-md items-start gap-2">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="miempresa"
            aria-label="Nombre a buscar"
            aria-invalid={validationError != null}
          />
          {validationError && (
            <p className="mt-1 text-sm text-destructive">{validationError}</p>
          )}
        </div>
        <Button type="submit" disabled={search.isFetching}>
          {search.isFetching ? <Spinner /> : <SearchIcon />}
          Buscar
        </Button>
      </form>

      {search.isFetching && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {search.isError && (
        <p className="text-sm text-destructive">{searchErrorMessage(search.error)}</p>
      )}

      {!search.isFetching && search.data && search.data.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No encontramos resultados para «{searchQuery}». Intenta con otro nombre.
        </p>
      )}

      {!search.isFetching && search.data && search.data.length > 0 && (
        <div className="flex flex-col gap-3">
          {sortDomainSearchResults(search.data).map((result) => (
            <DomainResultCard
              key={result.domain}
              result={result}
              loading={quote.isPending && selectedDomain === result.domain}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
