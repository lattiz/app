import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  SUPPORT_CATEGORIES,
  type SupportCategory,
  whatsAppSupportUrl,
} from './support';
import { WhatsAppIcon } from './WhatsAppIcon';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Supabase user id, sent only if the user ticks the checkbox. */
  customerId: string | null;
}

export function WhatsAppSupportDialog({ open, onOpenChange, customerId }: Props) {
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [message, setMessage] = useState('');
  const [shareCustomerId, setShareCustomerId] = useState(false);

  const isValid = message.trim().length > 0;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCategory(null);
      setMessage('');
      setShareCustomerId(false);
    }
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    window.open(
      whatsAppSupportUrl({
        category,
        message,
        customerId: shareCustomerId ? customerId : null,
      }),
      '_blank',
      'noopener,noreferrer',
    );
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Soporte prioritario por WhatsApp</DialogTitle>
          <DialogDescription>
            Cuéntanos qué necesitas y continuamos la conversación en WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="support-category">
                Tema <span className="text-muted-foreground">(opcional)</span>
              </FieldLabel>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as SupportCategory | null)}
              >
                <SelectTrigger id="support-category" className="w-full">
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="support-message">Describe tu solicitud</FieldLabel>
              <Textarea
                id="support-message"
                placeholder="Ej. Mi dominio no carga desde ayer…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                className="min-h-24"
                required
              />
            </Field>

            {customerId && (
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={shareCustomerId}
                  onCheckedChange={(checked) => setShareCustomerId(checked === true)}
                  className="mt-0.5"
                />
                <span>
                  Compartir mi número de cliente para darte una mejor atención
                </span>
              </label>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={!isValid}>
              <WhatsAppIcon className="size-4" />
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
