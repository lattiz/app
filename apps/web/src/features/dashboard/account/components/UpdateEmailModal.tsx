import { useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useUpdateEmail } from '../hooks/useUpdateEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string | null;
}

export function UpdateEmailModal({ open, onOpenChange, currentEmail }: Props) {
  const [email, setEmail] = useState('');
  const updateEmail = useUpdateEmail();

  const isValid = EMAIL_RE.test(email) && email !== currentEmail;

  function handleOpenChange(next: boolean) {
    if (!next) setEmail('');
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    updateEmail.mutate(email, {
      onSuccess: () => handleOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar email</DialogTitle>
          <DialogDescription>
            Enviaremos un enlace de verificación al nuevo correo. El cambio
            aplicará solo cuando lo confirmes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-email">Nuevo email</FieldLabel>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                placeholder="nuevo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateEmail.isPending}
                required
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="submit"
              disabled={!isValid || updateEmail.isPending}
            >
              {updateEmail.isPending && <Spinner data-icon="inline-start" />}
              {updateEmail.isPending
                ? 'Enviando…'
                : 'Enviar código de verificación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
