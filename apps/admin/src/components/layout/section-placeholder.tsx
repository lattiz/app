import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export function SectionPlaceholder({
  title,
  description,
  allowed,
}: {
  title: string;
  description?: string;
  allowed: boolean;
}) {
  if (!allowed) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={title} />
        <Card>
          <CardHeader>
            <CardTitle>No tienes acceso a esta sección</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
