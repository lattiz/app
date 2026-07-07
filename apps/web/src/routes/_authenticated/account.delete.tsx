import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { deleteAccount } from '@/lib/auth';

const CONFIRM_WORD = 'DELETE';

export const Route = createFileRoute('/_authenticated/account/delete')({
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await deleteAccount();
      await navigate({ to: '/login', search: { deleted: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account deletion failed');
      setPending(false);
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>This action is permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="delete-form" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="confirm">
                  Type <span className="font-mono font-semibold">{CONFIRM_WORD}</span> to confirm
                </FieldLabel>
                <Input
                  id="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <FormError message={error} />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="delete-form"
            variant="destructive"
            className="w-full"
            disabled={pending || confirm !== CONFIRM_WORD}
          >
            {pending && <Spinner data-icon="inline-start" />}
            Delete my account
          </Button>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
