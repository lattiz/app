import { Link } from '@tanstack/react-router';
import { ExternalLinkIcon, LockIcon } from 'lucide-react';
import type { TemplateGalleryItemDto } from '@lattiz/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { templateCardState } from '@/features/templates/template-access';
import { templateAccessCopy as copy } from '@/features/templates/template-access.copy';
import { cn } from '@/lib/utils';
import { TemplatePreviewFrame } from './TemplatePreviewFrame';

interface TemplateCardProps {
  template: TemplateGalleryItemDto;
  isCurrentTemplate: boolean;
  isSelecting: boolean;
  /** Trial ended (or publish is off): keep the current template, block a switch. */
  changeLocked?: boolean;
  /** The site's current template is above the plan (after a downgrade). */
  siteLocked?: boolean;
  onSelect: (templateId: string) => void;
}

export function TemplateCard({
  template,
  isCurrentTemplate,
  isSelecting,
  changeLocked = false,
  siteLocked = false,
  onSelect,
}: TemplateCardProps) {
  const state = templateCardState(template, {
    isCurrent: isCurrentTemplate,
    isSelecting,
    canPublish: !changeLocked,
    siteLocked,
  });

  return (
    <Card
      className={cn(isCurrentTemplate && 'ring-2 ring-primary ring-offset-1')}
      data-tier={template.tier}
      data-locked={state.hint !== null || undefined}
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
            <Badge
              variant={template.tier === 'pro' ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {copy.tierLabel[template.tier]}
            </Badge>
            {isCurrentTemplate && (
              <Badge variant="outline" className="shrink-0">
                {copy.current}
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
          {state.hint && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LockIcon className="size-3.5" />
              {state.hint === 'locked'
                ? copy.lockedHint
                : copy.currentLockedHint}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {template.previewUrl && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              render={
                <a
                  href={template.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {copy.preview} <ExternalLinkIcon />
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            variant={state.showUpgrade ? 'outline' : 'default'}
            disabled={state.actionDisabled}
            onClick={() => onSelect(template.id)}
          >
            {state.action === 'edit' ? copy.editTemplate : copy.useTemplate}
          </Button>
          {state.showUpgrade && (
            <Button
              size="sm"
              className="w-full"
              render={<Link to="/dashboard/subscription" />}
            >
              {copy.upgradeCta}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
