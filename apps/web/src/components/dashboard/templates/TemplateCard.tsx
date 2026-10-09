import { ExternalLinkIcon } from 'lucide-react';
import type { TemplateListItemDto } from '@lattiz/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TemplatePreviewFrame } from './TemplatePreviewFrame';

interface TemplateCardProps {
  template: TemplateListItemDto;
  isCurrentTemplate: boolean;
  isSelecting: boolean;
  /** Trial ended (or publish is off): keep the current template, block a switch. */
  changeLocked?: boolean;
  onSelect: (templateId: string) => void;
}

export function TemplateCard({
  template,
  isCurrentTemplate,
  isSelecting,
  changeLocked = false,
  onSelect,
}: TemplateCardProps) {
  return (
    <Card
      className={cn(isCurrentTemplate && 'ring-2 ring-primary ring-offset-1')}
    >
      <CardContent className="flex flex-col gap-3">
        <TemplatePreviewFrame
          thumbnailUrl={template.thumbnailUrl}
          previewUrl={template.previewUrl}
          templateName={template.name}
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{template.name}</p>
            {isCurrentTemplate && (
              <Badge variant="outline" className="shrink-0">
                actual
              </Badge>
            )}
          </div>
          {(template.category ?? template.description) && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {[template.category, template.description]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {template.previewUrl && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              render={
                <a href={template.previewUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              Vista previa <ExternalLinkIcon />
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            disabled={isSelecting || changeLocked}
            onClick={() => onSelect(template.id)}
          >
            {isCurrentTemplate ? 'Editar' : 'Usar este'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
