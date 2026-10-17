import type { AdminTemplateDetailDto } from '@lattiz/api-client';
import { FactList } from '@/components/fact-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { kitCheckLabel, readKitMeta } from './kit-meta';

export function TemplateKitCard({
  meta,
}: {
  meta: AdminTemplateDetailDto['kitMeta'];
}) {
  const view = readKitMeta(meta);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Ficha del kit</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {view ? (
          <>
            <FactList
              items={[
                { label: 'Giro', value: view.vertical ?? 'Sin dato' },
                { label: 'Dirección', value: view.direction ?? 'Sin dato' },
                { label: 'Arquetipo', value: view.archetype ?? 'Sin dato' },
                { label: 'Paleta', value: view.palette ?? 'Sin dato' },
                { label: 'Tipografía', value: view.fontPair ?? 'Sin dato' },
                { label: 'Último check', value: checkText(view.check) },
                { label: 'Commit', value: view.gitSha ?? 'Sin dato' },
              ]}
            />
            {view.sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin secciones</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {view.sections.map((section, index) => (
                  <li key={`${section.slot}-${section.variant}-${index}`}>
                    {section.slot} · {section.variant}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sin datos del kit (se llenan en el próximo seed).
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function checkText(check: { result: string; at?: string } | undefined): string {
  if (!check) return 'Sin dato';
  const label = kitCheckLabel(check.result);
  if (!check.at) return label;
  return `${label} · ${formatDate(check.at)}`;
}
