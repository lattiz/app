import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TagAddResult = {
  tags: string[];
  error: string | null;
};

export function ChipField({
  id,
  label,
  hint,
  tags,
  placeholder,
  addTag,
  onTagsChange,
}: {
  id: string;
  label: string;
  hint?: string;
  tags: readonly string[];
  placeholder: string;
  addTag: (tags: readonly string[], raw: string) => TagAddResult;
  onTagsChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  function commit(raw: string) {
    const result = addTag(tags, raw);
    onTagsChange(result.tags);
    setError(result.error);
    if (!result.error) setDraft('');
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1 rounded-3xl bg-muted px-2 text-xs"
                onClick={() =>
                  onTagsChange(tags.filter((item) => item !== tag))
                }
              >
                {tag}
                <span className="sr-only">Quitar {tag}</span>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex min-w-0 gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          aria-invalid={error != null}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commit(draft);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => commit(draft)}>
          Agregar
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
