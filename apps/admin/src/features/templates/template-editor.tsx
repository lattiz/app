import {
  adminTemplatesControllerGetQueryKey,
  adminTemplatesControllerListQueryKey,
  adminTemplatesControllerUpdateMutation,
  type AdminTemplateDetailDto,
} from '@lattiz/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { ChipField } from '@/components/chip-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  addSlugTag,
  templateDraftError,
  templateMutationMessage,
  templateUpdateBody,
  type TemplateDraft,
} from './actions';
import { templateTierBadge } from './labels';

export function TemplateEditor({
  detail,
  disabled,
}: {
  detail: AdminTemplateDetailDto;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => {
          setSession((current) => current + 1);
          setOpen(true);
        }}
      >
        Editar
      </Button>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open ? (
            <EditorForm
              key={session}
              detail={detail}
              onClose={() => setOpen(false)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function EditorForm({
  detail,
  onClose,
}: {
  detail: AdminTemplateDetailDto;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<TemplateDraft>({
    name: detail.name,
    description: detail.description ?? '',
    category: detail.category ?? '',
    tags: detail.tags,
    featured: detail.featured,
  });
  const [error, setError] = useState<string | null>(null);
  const update = useMutation({
    ...adminTemplatesControllerUpdateMutation(),
    onSuccess: (next) => {
      queryClient.setQueryData(
        adminTemplatesControllerGetQueryKey({ path: { id: detail.id } }),
        next,
      );
      void queryClient.invalidateQueries({
        queryKey: adminTemplatesControllerListQueryKey(),
      });
      toast.success('Cambios guardados.');
      onClose();
    },
    onError: (mutationError) => {
      toast.error(templateMutationMessage(mutationError, detail.id));
    },
  });

  function save() {
    const problem = templateDraftError(draft);
    setError(problem);
    if (problem) return;
    update.mutate({ path: { id: detail.id }, body: templateUpdateBody(draft) });
  }

  const tier = templateTierBadge(detail.tier);

  return (
    <>
      <SheetHeader>
        <SheetTitle>Editar plantilla</SheetTitle>
        <SheetDescription>
          Estos datos se ven en la galería de plantillas.
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-4 px-6">
        <Field label="Nombre" id="template-name">
          <Input
            id="template-name"
            value={draft.name}
            maxLength={80}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />
        </Field>
        <Field label="Descripción" id="template-description">
          <Textarea
            id="template-description"
            value={draft.description}
            maxLength={500}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
          />
        </Field>
        <Field label="Categoría" id="template-category">
          <Input
            id="template-category"
            value={draft.category}
            maxLength={40}
            onChange={(event) =>
              setDraft({ ...draft, category: event.target.value })
            }
          />
        </Field>
        <ChipField
          id="template-tags"
          label="Etiquetas"
          hint="Minúsculas, hasta 10."
          tags={draft.tags}
          placeholder="cafe, terraza"
          addTag={addSlugTag}
          onTagsChange={(tags) => setDraft({ ...draft, tags })}
        />
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Destacada</span>
          <Switch
            checked={draft.featured}
            onCheckedChange={(checked) =>
              setDraft({ ...draft, featured: checked })
            }
          />
        </label>
        <div>
          <p className="text-sm font-medium">Nivel</p>
          <p className="text-sm">{tier.label}</p>
          <p className="text-sm text-muted-foreground">Lo define el kit.</p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <SheetFooter>
        <Button type="button" disabled={update.isPending} onClick={save}>
          {update.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={update.isPending}
          onClick={onClose}
        >
          Cancelar
        </Button>
      </SheetFooter>
    </>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
