import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/stores/auth.store';
import { UpdateEmailModal } from '../components/UpdateEmailModal';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium">{children}</span>
    </div>
  );
}

export function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);

  const isVerified = Boolean(user?.email_confirmed_at);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cuenta</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <Row label="Email">
          {user?.email ?? '—'}
          <Badge
            variant="secondary"
            className={
              isVerified
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
            }
          >
            {isVerified ? 'Verificado' : 'No verificado'}
          </Badge>
        </Row>
        <Row label="Miembro desde">
          {user?.created_at ? formatDate(user.created_at) : '—'}
        </Row>
        <div className="flex justify-end pt-3">
          <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            Actualizar email
          </Button>
        </div>
      </CardContent>

      <UpdateEmailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentEmail={user?.email ?? null}
      />
    </Card>
  );
}
