import { LayoutIcon } from 'lucide-react';

interface TemplatePreviewFrameProps {
  thumbnailUrl: string | null;
  previewUrl: string | null;
  templateName: string;
}

export function TemplatePreviewFrame({
  thumbnailUrl,
  previewUrl,
  templateName,
}: TemplatePreviewFrameProps) {
  if (thumbnailUrl) {
    return (
      <div className="h-44 overflow-hidden rounded-2xl bg-muted">
        <img
          src={thumbnailUrl}
          alt={templateName}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className="relative h-44 overflow-hidden rounded-2xl bg-muted">
        <iframe
          src={previewUrl}
          title={`Preview de ${templateName}`}
          sandbox="allow-same-origin"
          scrolling="no"
          className="pointer-events-none absolute top-0 left-0"
          style={{
            width: '200%',
            height: '200%',
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
            border: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-44 items-center justify-center rounded-2xl bg-muted">
      <LayoutIcon className="size-10 text-muted-foreground/40" />
    </div>
  );
}
